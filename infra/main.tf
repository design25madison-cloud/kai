# APIs, network, database, secrets and the image repository. Follows the layout of the Richard
# project's infra (25Madison/richard, infra/modules/foundation), cut down to what KAI uses.

data "google_project" "current" {
  project_id = var.project_id
}

locals {
  name_prefix = "kai-${var.environment}"
  service     = "kai"

  labels = {
    application = "kai"
    environment = var.environment
    managed_by  = "terraform"
  }

  required_services = toset([
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "iap.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
  ])
}

resource "google_project_service" "required" {
  for_each = local.required_services

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_project_service_identity" "iap" {
  provider = google-beta
  project  = var.project_id
  service  = "iap.googleapis.com"

  depends_on = [google_project_service.required]
}

resource "google_project_service_identity" "cloudbuild" {
  provider = google-beta
  project  = var.project_id
  service  = "cloudbuild.googleapis.com"

  depends_on = [google_project_service.required]
}

# --- Network: the database has no public address, so Cloud Run reaches it over this network.

resource "google_compute_network" "app" {
  project                 = var.project_id
  name                    = "${local.name_prefix}-net"
  auto_create_subnetworks = false

  depends_on = [google_project_service.required]
}

resource "google_compute_subnetwork" "serverless" {
  project       = var.project_id
  name          = "${local.name_prefix}-serverless"
  region        = var.region
  network       = google_compute_network.app.id
  ip_cidr_range = "10.30.0.0/24"
}

resource "google_compute_global_address" "private_services" {
  project       = var.project_id
  name          = "${local.name_prefix}-private-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.app.id
}

resource "google_service_networking_connection" "private_services" {
  network                 = google_compute_network.app.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services.name]

  depends_on = [google_project_service.required]
}

# --- Database

resource "google_sql_database_instance" "postgres" {
  project             = var.project_id
  name                = "${local.name_prefix}-postgres"
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = true

  settings {
    tier              = var.database_tier
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 10
    disk_autoresize   = true
    edition           = "ENTERPRISE"
    user_labels       = local.labels

    backup_configuration {
      enabled    = true
      start_time = "04:00"

      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.app.id
      enable_private_path_for_google_cloud_services = true
      ssl_mode                                      = "ENCRYPTED_ONLY"
    }

    maintenance_window {
      day          = 7
      hour         = 5
      update_track = "stable"
    }
  }

  depends_on = [
    google_project_service.required,
    google_service_networking_connection.private_services,
  ]
}

resource "google_sql_database" "application" {
  project  = var.project_id
  instance = google_sql_database_instance.postgres.name
  name     = "kai"
}

# The kai_app database user is created outside Terraform (see README.md), because Terraform would
# keep its password in state.

# --- Secrets: containers only. Values are added outside Terraform and never reach its state.

resource "google_secret_manager_secret" "database_password" {
  project   = var.project_id
  secret_id = "kai-database-password"
  labels    = local.labels

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret" "unsplash_access_key" {
  project   = var.project_id
  secret_id = "kai-unsplash-access-key"
  labels    = local.labels

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

# --- Container images

resource "google_artifact_registry_repository" "containers" {
  project       = var.project_id
  location      = var.region
  repository_id = "kai"
  description   = "KAI application container images"
  format        = "DOCKER"
  labels        = local.labels

  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "delete-untagged"
    action = "DELETE"

    condition {
      tag_state  = "UNTAGGED"
      older_than = "2592000s"
    }
  }

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"

    most_recent_versions {
      keep_count = 20
    }
  }

  depends_on = [google_project_service.required]
}

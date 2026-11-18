# The Cloud Run service, who may sign in to it, and the manual deploy trigger.

resource "google_cloud_run_v2_service" "app" {
  provider            = google-beta
  project             = var.project_id
  location            = var.region
  name                = local.service
  ingress             = "INGRESS_TRAFFIC_ALL"
  iap_enabled         = true
  deletion_protection = false
  labels              = local.labels

  template {
    service_account = google_service_account.app.email

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"
      network_interfaces {
        network    = google_compute_network.app.name
        subnetwork = google_compute_subnetwork.serverless.name
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    containers {
      image = var.image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      # server/index.js checks the sign-in header against this value.
      env {
        name  = "IAP_AUDIENCE"
        value = "/projects/${data.google_project.current.number}/locations/${var.region}/services/${local.service}"
      }

      # The pg library reads these names directly.
      env {
        name  = "PGHOST"
        value = "/cloudsql/${google_sql_database_instance.postgres.connection_name}"
      }

      env {
        name  = "PGDATABASE"
        value = google_sql_database.application.name
      }

      env {
        name  = "PGUSER"
        value = "kai_app"
      }

      env {
        name = "PGPASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_password.secret_id
            version = "latest"
          }
        }
      }

      dynamic "env" {
        for_each = var.unsplash_key_set ? [1] : []
        content {
          name = "UNSPLASH_ACCESS_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.unsplash_access_key.secret_id
              version = "latest"
            }
          }
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.postgres.connection_name]
      }
    }
  }

  # Cloud Build owns the image; Terraform owns everything else about the service. The other three
  # are fields gcloud stamps on every deploy.
  lifecycle {
    ignore_changes = [template[0].containers[0].image, client, client_version, scaling]
  }

  depends_on = [
    google_project_service.required,
    google_project_iam_member.app_sql_client,
    google_secret_manager_secret_iam_member.app_database_password,
    google_secret_manager_secret_iam_member.app_unsplash_access_key,
  ]
}

# Only the sign-in gate (IAP) may call the service. Nobody reaches it directly.
resource "google_cloud_run_v2_service_iam_member" "iap_invokes_app" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_project_service_identity.iap.email}"
}

# Who gets through the gate: the Workspace domain, extra domains, and named people.
resource "google_iap_web_cloud_run_service_iam_member" "access" {
  for_each = toset(concat(
    ["domain:${var.workspace_domain}"],
    [for domain in var.iap_domains : "domain:${domain}"],
    [for user in var.iap_users : "user:${user}"],
  ))

  project                = var.project_id
  location               = var.region
  cloud_run_service_name = google_cloud_run_v2_service.app.name
  role                   = "roles/iap.httpsResourceAccessor"
  member                 = each.value
}

# Deploys are manual: open the trigger in the Cloud Build console, pick a branch, press Run.
resource "google_cloudbuild_trigger" "branch_deploy" {
  count = var.enable_branch_deploy_trigger ? 1 : 0

  project     = var.project_id
  location    = var.region
  name        = "${local.name_prefix}-deploy-branch"
  description = "Manually deploy a selected git branch to Cloud Run."

  service_account = google_service_account.build.id

  source_to_build {
    uri       = "https://github.com/${var.github_owner}/${var.github_repository}"
    ref       = "refs/heads/main"
    repo_type = "GITHUB"
  }

  git_file_source {
    path      = "cloudbuild.yaml"
    uri       = "https://github.com/${var.github_owner}/${var.github_repository}"
    revision  = "refs/heads/main"
    repo_type = "GITHUB"
  }

  include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"

  depends_on = [
    google_project_service.required,
    google_service_account_iam_member.cloudbuild_uses_build,
  ]
}

output "service_url" {
  value = google_cloud_run_v2_service.app.uri
}

output "build_service_account" {
  value = google_service_account.build.id
}

output "database_instance" {
  value = google_sql_database_instance.postgres.name
}

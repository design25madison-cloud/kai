# Two identities: one the app runs as, one Cloud Build deploys as.

resource "google_service_account" "app" {
  project      = var.project_id
  account_id   = "${local.name_prefix}-app"
  display_name = "KAI ${var.environment} app"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "build" {
  project      = var.project_id
  account_id   = "${local.name_prefix}-build"
  display_name = "KAI ${var.environment} Cloud Build"

  depends_on = [google_project_service.required]
}

resource "google_project_iam_member" "app_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = google_service_account.app.member
}

resource "google_secret_manager_secret_iam_member" "app_database_password" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.database_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.app.member
}

resource "google_secret_manager_secret_iam_member" "app_unsplash_access_key" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.unsplash_access_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.app.member
}

resource "google_project_iam_member" "build_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = google_service_account.build.member
}

resource "google_project_iam_member" "build_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = google_service_account.build.member
}

resource "google_service_account_iam_member" "build_uses_app" {
  service_account_id = google_service_account.app.name
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.build.member
}

resource "google_service_account_iam_member" "cloudbuild_uses_build" {
  service_account_id = google_service_account.build.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_project_service_identity.cloudbuild.email}"
}

resource "google_artifact_registry_repository_iam_member" "build_writer" {
  project    = var.project_id
  location   = google_artifact_registry_repository.containers.location
  repository = google_artifact_registry_repository.containers.name
  role       = "roles/artifactregistry.writer"
  member     = google_service_account.build.member
}

# `gcloud builds submit` uploads the source to this bucket (gcloud creates it on first use), and the
# build account has to read it. Builds started from the GitHub trigger don't use it.
resource "google_storage_bucket_iam_member" "build_reads_source" {
  bucket = "${var.project_id}_cloudbuild"
  role   = "roles/storage.objectViewer"
  member = google_service_account.build.member
}

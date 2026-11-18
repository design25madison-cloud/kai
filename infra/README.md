# KAI on Google Cloud

Terraform for the hosted version. It follows the Richard project's infra (`25Madison/richard`,
`infra/`), cut down to what KAI uses.

## What it creates

- **Cloud Run service `kai`:** the app and its small server (`server/`), behind Google sign-in (IAP).
- **Who can sign in:** everyone at `workspace_domain`, plus `iap_domains` and `iap_users`.
- **Cloud SQL Postgres 16:** saved projects. It has no public address; Cloud Run reaches it over a private network.
- **Secret Manager:** containers for the database password and the Unsplash key. Values are added
  outside Terraform, so they never reach its state.
- **Artifact Registry `kai`:** container images.
- **Two service accounts:** one the app runs as, one Cloud Build deploys as.
- **A manual Cloud Build trigger** (optional): pick a branch, press Run. Nothing deploys on push.

## First-time setup

Real values live in an untracked `terraform.tfvars` (copy `terraform.tfvars.example`).

1. Sign in: `gcloud auth login` and `gcloud auth application-default login`.
2. Create the state bucket once, outside Terraform: private, versioned, uniform access.
3. `terraform init -backend-config="bucket=STATE_BUCKET" -backend-config="prefix=kai/dev"`
4. Apply the APIs and the two secret containers first (a targeted apply, this one time).
5. Add the database password without showing it:
   `openssl rand -hex 32 | tr -d '\n' | gcloud secrets versions add kai-database-password --data-file=- --project PROJECT_ID`
6. Apply everything. The service starts on a placeholder image.
7. Create the `kai_app` database user with the password from the secret.
8. Deploy the real image (below).
9. Create the sign-in client by hand. Every account needs it, 25madison.com included, because the
   project sits in a different Google organization. In Google Auth Platform: audience External
   (leave it in Testing, as Richard does), then a Web application client with the redirect URI
   `https://iap.googleapis.com/v1/oauth/clientIds/CLIENT_ID:handleRedirect`. Attach it with
   `gcloud iap settings set FILE --resource-type=cloud-run --service=kai --region=us-central1`.
   The client secret stays out of Terraform and out of the repository.

## Deploying

From the repository root, with the build service account Terraform created:

```bash
gcloud builds submit --project PROJECT_ID --region us-central1 \
  --service-account projects/PROJECT_ID/serviceAccounts/kai-dev-build@PROJECT_ID.iam.gserviceaccount.com \
  --config cloudbuild.yaml .
```

The build runs the server tests, builds the image, and points the service at it. Once the Cloud
Build GitHub App is connected to the repository, set `enable_branch_deploy_trigger = true` and
deploy from the Cloud Build console instead.

## Adding someone

Add their Google account to `iap_users` in `terraform.tfvars` and apply.

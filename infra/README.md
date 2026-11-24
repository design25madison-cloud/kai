# KAI on Google Cloud

Terraform for the hosted version. It follows the Richard project's infra (`25Madison/richard`,
`infra/`), cut down to what KAI uses.

## What it creates

- **Cloud Run service `kai`:** the app and its small server (`server/`), behind Google sign-in (IAP).
- **Who can sign in:** everyone at `workspace_domain`, plus `iap_domains` and `iap_users`.
- **Cloud SQL Postgres 16:** saved projects. It has no public address; Cloud Run reaches it over a private network.
- **Secret Manager:** containers for the database password and the Unsplash key. Values are added
  outside Terraform, so they never reach its state.
- **Uploads bucket:** files people add to a project. Private; only the app can read or write it.
- **Cloud Run service `kai-converter`:** turns PowerPoint and Word uploads into PDFs (`converter/`). It has no access to anything, cannot send traffic anywhere (a firewall rule drops all of it), and only the app may call it.
- **Gemini access:** the app's service account may call Gemini through Agent Platform. There is no API key.
- **Artifact Registry `kai`:** container images.
- **Three service accounts:** the app, the converter, and Cloud Build.
- **A manual Cloud Build trigger** (optional): pick a branch, press Run. Nothing deploys on push.

## First-time setup

Real values live in an untracked `terraform.tfvars` (copy `terraform.tfvars.example`).

1. Sign in: `gcloud auth login` and `gcloud auth application-default login`.
2. Create the state bucket once, outside Terraform: private, versioned, uniform access.
3. `terraform init -backend-config="bucket=STATE_BUCKET" -backend-config="prefix=kai/dev"`
4. Apply the APIs and the two secret containers first (a targeted apply, this one time).
5. Add the database password without showing it:
   `openssl rand -hex 32 | tr -d '\n' | gcloud secrets versions add kai-database-password --data-file=- --project PROJECT_ID`
6. Create the bucket `gcloud builds submit` uploads source to, because the next step grants the
   build account read on it and `gcloud` would otherwise only create it on the first deploy:
   `gcloud storage buckets create gs://PROJECT_ID_cloudbuild --project PROJECT_ID --location us --uniform-bucket-level-access`
7. Apply everything. The service starts on a placeholder image.
8. Create the `kai_app` database user with the password from the secret.
9. Deploy the real image (below).
10. Create the sign-in client by hand. Every account needs it, 25madison.com included, because the
   project sits in a different Google organization. In Google Auth Platform: audience External
   (leave it in Testing, as Richard does), then a Web application client with the redirect URI
   `https://iap.googleapis.com/v1/oauth/clientIds/CLIENT_ID:handleRedirect`. Attach it with
   `gcloud iap settings set FILE --resource-type=cloud-run --service=kai --region=us-central1`.
   The client secret stays out of Terraform and out of the repository.

## Deploying

Deploy with the script, from a clean checkout of the commit you want to ship:

```bash
scripts/deploy.sh
```

It refuses to run if `git status` shows any change, so the image is exactly a commit. It reads the
project ID from `terraform.tfvars` and runs `gcloud builds submit` as the build service account
Terraform created. The build runs the server tests, builds both images (tagged with the build ID and
the short commit hash), and points the services at them; each revision carries a `commit` label. Once the Cloud
Build GitHub App is connected to the repository, set `enable_branch_deploy_trigger = true` and
deploy from the Cloud Build console instead.

## Adding someone

Add their Google account to `iap_users` in `terraform.tfvars` and apply.

That is not always enough: the sign-in client's consent screen (step 10 above) is External and was
left in Testing, and while it stays in Testing Google admits only accounts on its test-user list.
So either publish the consent screen (Google Auth Platform, Audience, Publish app), or also add
each person, including everyone in `workspace_domain` and `iap_domains`, as a test user there.
Check which of the two is true for the project before relying on the IAP list alone.

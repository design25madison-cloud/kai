#!/bin/sh
# Deploys the committed code to Cloud Run (see infra/README.md, "Deploying"). It refuses to run with
# uncommitted or untracked changes, so every image matches a commit, and it tags the images and the
# Cloud Run revisions with that commit.
set -eu

cd "$(dirname "$0")/.."

changes=$(git status --porcelain)
if [ -n "$changes" ]; then
  echo "Commit or stash these changes first; a deploy ships only committed code:" >&2
  echo "$changes" >&2
  exit 1
fi

# The project ID stays in the untracked infra/terraform.tfvars, never in the repository.
project=$(sed -n 's/^[[:space:]]*project_id[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' infra/terraform.tfvars | head -n 1)
if [ -z "$project" ]; then
  echo "No project_id found in infra/terraform.tfvars (copy terraform.tfvars.example)." >&2
  exit 1
fi

commit=$(git rev-parse --short HEAD)

gcloud builds submit --project "$project" --region us-central1 \
  --service-account "projects/$project/serviceAccounts/kai-dev-build@$project.iam.gserviceaccount.com" \
  --substitutions "_COMMIT=$commit" \
  --config cloudbuild.yaml .

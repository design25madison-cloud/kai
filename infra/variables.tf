variable "project_id" {
  description = "GCP project to deploy into. Set it in an untracked terraform.tfvars."
  type        = string
}

variable "environment" {
  description = "Short environment name, used in resource names."
  type        = string
  default     = "dev"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "workspace_domain" {
  description = "Google Workspace domain whose members can all sign in."
  type        = string
  default     = "25madison.com"
}

variable "iap_domains" {
  description = "Additional Google Workspace domains whose members can all sign in."
  type        = list(string)
  default     = []
}

variable "iap_users" {
  description = "Individual Google accounts that can sign in, such as people outside the Workspace domains."
  type        = list(string)
  default     = []
}

variable "image" {
  description = "Bootstrap image only. Cloud Build replaces it on every deploy."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "database_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "unsplash_key_set" {
  description = "Set to true once the kai-unsplash-access-key secret has a version. Without it, image search uses Wikimedia Commons."
  type        = bool
  default     = false
}

variable "enable_branch_deploy_trigger" {
  description = "Create the manual Cloud Build trigger. Needs the Cloud Build GitHub App connected to the repository first."
  type        = bool
  default     = false
}

variable "github_owner" {
  type    = string
  default = "design25madison-cloud"
}

variable "github_repository" {
  type    = string
  default = "kai"
}

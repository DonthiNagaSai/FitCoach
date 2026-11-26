variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance size. t3.micro keeps costs inside the Free Tier credits."
  type        = string
  default     = "t3.micro"
}

variable "image" {
  description = "Container image to run (built and pushed by the Docker GitHub Actions workflow)"
  type        = string
  default     = "ghcr.io/donthinagasai/fitcoach:latest"
}

variable "ssm_parameter_prefix" {
  description = "SSM Parameter Store path holding the app's environment variables (create these by hand, never in Terraform state)"
  type        = string
  default     = "/fitcoach"
}

variable "budget_email" {
  description = "Email that receives the monthly cost alert"
  type        = string
}

variable "monthly_budget_usd" {
  description = "Monthly spend that triggers the budget alert"
  type        = string
  default     = "5"
}

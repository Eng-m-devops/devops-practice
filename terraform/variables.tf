variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for provisioning resources"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Execution environment (development, staging, production)"
}

variable "project_name" {
  type        = string
  default     = "enterprise-devops"
  description = "Project identifier name"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for the VPC"
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "CIDR block for the public subnet"
}

variable "instance_type" {
  type        = string
  default     = "t3.small"
  description = "EC2 instance type"
}

variable "ssh_public_key" {
  type        = string
  default     = ""
  description = "SSH public key content for server access"
}

variable "allowed_ssh_cidr" {
  type        = list(string)
  default     = ["0.0.0.0/0"]
  description = "CIDR blocks allowed for SSH access"
}

output "environment" {
  value       = var.environment
  description = "Current infrastructure environment"
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the VPC"
}

output "public_subnet_id" {
  value       = aws_subnet.public.id
  description = "The ID of the public subnet"
}

output "server_public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "Public IP address of the Enterprise DevOps server"
}

output "server_public_dns" {
  value       = aws_instance.app_server.public_dns
  description = "Public DNS of the Enterprise DevOps server"
}

output "ssh_command" {
  value       = "ssh ubuntu@${aws_instance.app_server.public_ip}"
  description = "Command to SSH into the provisioned server"
}

output "app_url" {
  value       = "http://${aws_instance.app_server.public_ip}"
  description = "URL to access the deployed frontend application"
}

output "api_url" {
  value       = "http://${aws_instance.app_server.public_ip}:5000/api/status"
  description = "URL to access the deployed backend API health endpoint"
}

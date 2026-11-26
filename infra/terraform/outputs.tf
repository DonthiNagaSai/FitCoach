output "app_url" {
  description = "Public URL of the app"
  value       = "http://${aws_eip.app.public_ip}"
}

output "health_url" {
  value = "http://${aws_eip.app.public_ip}/api/health"
}

output "instance_id" {
  description = "Use with: aws ssm start-session --target <id>"
  value       = aws_instance.app.id
}

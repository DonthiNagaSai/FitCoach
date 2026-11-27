# -----------------------------------------------------------------------------
# Networking: use the account's default VPC to keep the setup small and cheap
# -----------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

# Not every availability zone offers every instance type (us-east-1e has no t3.micro),
# so only use subnets in zones where the chosen type is available
data "aws_ec2_instance_type_offerings" "available" {
  location_type = "availability-zone"

  filter {
    name   = "instance-type"
    values = [var.instance_type]
  }
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "availability-zone"
    values = data.aws_ec2_instance_type_offerings.available.locations
  }
}

# Latest Amazon Linux 2023 AMI, looked up through the public SSM parameter
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

data "aws_caller_identity" "current" {}

resource "aws_security_group" "web" {
  name        = "fitcoach-web"
  description = "HTTP in, everything out. No SSH: access is through SSM Session Manager."
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# -----------------------------------------------------------------------------
# IAM: the instance can use Session Manager, read its own secrets and write logs
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "fitcoach-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "app" {
  statement {
    sid       = "ReadAppConfig"
    actions   = ["ssm:GetParametersByPath", "ssm:GetParameter"]
    resources = ["arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_parameter_prefix}*"]
  }

  statement {
    sid       = "WriteLogs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"]
    resources = ["${aws_cloudwatch_log_group.app.arn}:*"]
  }
}

resource "aws_iam_role_policy" "app" {
  name   = "fitcoach-app"
  role   = aws_iam_role.app.id
  policy = data.aws_iam_policy_document.app.json
}

resource "aws_iam_instance_profile" "app" {
  name = "fitcoach-ec2"
  role = aws_iam_role.app.name
}

# -----------------------------------------------------------------------------
# Logs, compute and a fixed public IP
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "app" {
  name              = "/fitcoach/app"
  retention_in_days = 7
}

resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023.value
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.app.name

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    region     = var.aws_region
    image      = var.image
    ssm_prefix = var.ssm_parameter_prefix
    log_group  = aws_cloudwatch_log_group.app.name
  })

  user_data_replace_on_change = true

  metadata_options {
    http_tokens = "required" # IMDSv2 only
  }

  root_block_device {
    volume_size = 10
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "fitcoach-app"
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
}

# -----------------------------------------------------------------------------
# Monitoring and cost guardrails
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "status_check" {
  alarm_name          = "fitcoach-status-check-failed"
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_System"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  # Recover the instance automatically if the underlying host fails
  alarm_actions = ["arn:aws:automate:${var.aws_region}:ec2:recover"]
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "fitcoach-high-cpu"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    InstanceId = aws_instance.app.id
  }
}

resource "aws_budgets_budget" "monthly" {
  name         = "fitcoach-monthly"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_email]
  }
}

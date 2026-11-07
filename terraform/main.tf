terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

resource "aws_vpc" "devsecops_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "devsecops-3tier-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.devsecops_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags = {
    Name = "devsecops-public-subnut"
  }
}

resource "aws_instance" "kubernetes_node" {
  ami           = "ami-04e601378cf6af28c" # Ubuntu 22.04 LTS
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.public_subnet.id
  tags = {
    Name = "devsecops-k3s-server"
  }
}

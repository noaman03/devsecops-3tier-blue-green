# Enterprise DevSecOps 3-Tier Application with Automated CI/CD & GitOps Blue-Green Deployments

A production-grade, end-to-end DevSecOps pipeline and Kubernetes deployment architecture demonstrating secure software development lifecycles (SSDLC), automated container scanning, and zero-downtime Blue-Green deployments.

---

## 🏗️ Architecture Overview

This project implements a decoupled 3-tier web application structured as follows:
1. **Frontend Tier (`nginx:alpine`)**: Serves the web interface, acts as a reverse proxy, and safely routes `/api/` traffic internally to the backend service.
2. **Backend Tier (`Node.js / Express`)**: Handles application logic, runs behind a `Rollout`, and features a health-check endpoint (`/api/health`) for Kubernetes `readinessProbe`.
3. **Database Tier (`MongoDB 7.0`)**: Stateful layer anchored securely with a `PersistentVolumeClaim (PVC)` to guarantee data persistence across version upgrades and rollouts.

---

## 🛠️ Tech Stack & Tooling

* **Containerization & Orchestration**: Docker, Docker Compose, Kubernetes (K3s).
* **CI/CD & Security (DevSecOps)**: Jenkins (Pipeline-as-Code), Trivy (Filesystem & Image vulnerability scanning), SonarQube (Static Application Security Testing - SAST & Quality Gates).
* **GitOps & Deployment Strategies**: ArgoCD (Continuous Delivery), Argo Rollouts (Zero-Downtime Blue-Green Strategy).
* **Infrastructure as Code (IaC)**: Terraform.

---

## 🔄 DevSecOps CI/CD Pipeline Workflow

The automated `Jenkinsfile` executes the following 8 rigorous stages on every commit to `main`:
1. **Checkout SCM**: Clones the latest codebase from GitHub.
2. **Backend Unit Tests**: Installs dependencies and runs automated test suites (`npm test`).
3. **Trivy FileSystem Scan**: Inspects code directories and `package.json` for known vulnerabilities (CVEs) and leaked secrets.
4. **SonarQube SAST Analysis**: Performs deep code quality and security hotspot analysis.
5. **Quality Gate Validation**: Halts the pipeline immediately if SonarQube quality metrics fail (`Quality Gate: PASSED`).
6. **Docker Build**: Compiles hardened Docker images for both frontend and backend services.
7. **Trivy Image Scan**: Scans the built container images from inside for OS package vulnerabilities.
8. **Push to Docker Hub**: Authenticates securely and publishes tagged images (`v1.0.${BUILD_NUMBER}` & `latest`) to Docker Hub (`noaman003/`).

---

## 🚀 GitOps & Blue-Green Deployment Strategy (Argo Rollouts)

* **Zero Downtime**: Instead of standard rolling updates, the backend utilizes `kind: Rollout` configured for a **Blue-Green** deployment strategy.
* **Active vs. Preview Services**: 
  * `backend-service` routes live user traffic to the stable environment (`Blue / v1.0.0`).
  * `backend-preview-service` targets the newly deployed candidate environment (`Green / v2.0.0`) for validation.
* **Controlled Promotion**: With `autoPromotionEnabled: false`, the rollout pauses securely after spinning up the green pods, allowing validation before executing `kubectl argo rollouts promote` to seamlessly switch active traffic.
* **GitOps Sync**: ArgoCD continuously monitors this repository (`k8s/` folder), enforcing state synchronization and automatic self-healing (`selfHeal: true`).

---

## 📊 Quick Access & Reference

| Component | Access Endpoint / URL | Credentials / Notes |
| :--- | :--- | :--- |
| **Frontend Application** | `http://<VM-IP>:30080` | Public NodePort interface |
| **Argo Rollouts Dashboard**| `http://<VM-IP>:3100` | Real-time Blue-Green monitoring |
| **ArgoCD UI (GitOps)** | `https://<VM-IP>:30443` | `admin` / `jp2TShUvRsXvfA03` |
| **Jenkins CI Server** | `http://<VM-IP>:8081` | `admin` / `43abc255852344b4b83d5c0e32f13cb7` |
| **SonarQube Dashboard** | `http://<VM-IP>:9000` | `admin` / `123` |

---

## 📂 Repository Structure

```text
├── backend/                  # Node.js REST API source code & tests
├── frontend/                 # Nginx & static web UI assets
├── k8s/                      # Kubernetes & Argo Rollouts manifests
│   ├── mongodb.yaml          # PVC, Deployment, and ClusterIP Service
│   ├── backend-rollout.yaml  # Argo Rollouts Blue-Green definition & services
│   └── frontend-deployment.yaml # Frontend Deployment & NodePort Service
├── terraform/                # Infrastructure as Code (AWS VPC & EC2/EKS)
├── Jenkinsfile               # 8-Stage DevSecOps declarative pipeline
└── docker-compose.ci.yml     # Local CI server stack (Jenkins & SonarQube)

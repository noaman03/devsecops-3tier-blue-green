pipeline {
    agent any

    environment {
        SCANNER_HOME    = tool 'sonar-scanner'
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        BACKEND_IMAGE   = "${DOCKERHUB_CREDS_USR}/devsecops-backend"
        FRONTEND_IMAGE  = "${DOCKERHUB_CREDS_USR}/devsecops-frontend"
        IMAGE_TAG       = "v1.0.${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/noaman03/devsecops-3tier-blue-green.git'
            }
        }

        stage('2. Backend Unit Tests') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('3. Trivy FileSystem Scan') {
            steps {
                sh 'trivy fs --scanners vuln,secret --severity HIGH,CRITICAL --exit-code 0 .'
            }
        }

        stage('4. SonarQube SAST Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner -Dsonar.projectKey=devsecops-3tier-app -Dsonar.projectName=DevSecOps-3Tier-App -Dsonar.sources=backend,frontend -Dsonar.exclusions=**/node_modules/**"
                }
            }
        }

        stage('5. SonarQube Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('6. Build Docker Images') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
            }
        }

        stage('7. Trivy Container Image Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --exit-code 0 ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "trivy image --severity HIGH,CRITICAL --exit-code 0 ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('8. Push Images to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin'
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
                sh 'docker logout'
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f'
        }
    }
}

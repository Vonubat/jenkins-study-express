pipeline {
    agent any

    environment {
        API_KEY = credentials('prod-api-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test & Compile') {
            agent {
                docker {
                    image 'node:24-alpine'
                    reuseNode true
                }
            }
            steps {
                echo 'Hello from inside the temporary Node container!'
                sh 'node -v'

                sh 'npm ci'
                sh 'npm test'
                sh 'npm run build'
                sh 'npm prune --omit=dev'
            }
        }

        stage('Package Docker Image') {
            // This stage falls back to 'agent any' (the Master)
            // because the Master is the one connected to the Docker socket!
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t jenkins-express-dummy:latest .'
            }
        }

        stage('Approval') {
            when {
                beforeInput true
                allOf {
                    branch 'main'
                    not { changeRequest() }
                }
            }
            input {
                message 'Code looks good! Approve deployment to Production?'
                ok 'Deploy to Prod'
            }
            steps {
                echo 'Approval granted! Proceeding to deployment...'
            }
        }

        stage('Deploy') {
            when {
                allOf {
                    branch 'main'
                    not { changeRequest() }
                }
            }
            steps {
                echo 'Deploying the new Docker container...'

                sh 'docker rm -f my-express-prod || true'
                sh 'docker run -d --name my-express-prod -p 3000:3000 -e API_KEY=${API_KEY} jenkins-express-dummy:latest'
            }
        }
    }

    post {
        always {
            junit 'test-results.xml'
        }
    }
}

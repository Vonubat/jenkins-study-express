pipeline {
    agent any

    tools {
        nodejs 'node24'
        dockerTool 'docker-cli'
    }

    environment {
        // This maps the Jenkins credential 'prod-api-key' to the environment variable 'API_KEY'
        API_KEY = credentials('prod-api-key')
    }

    stages {
        stage('Checkout') {
            steps {
                // This tells Jenkins to pull the code from the Git repository
                checkout scm
            }
        }

        stage('Test') {
            steps {
                echo 'Installing all dependencies for testing...'
                sh 'npm ci'
                echo 'Running unit tests...'
                sh 'npm test'
            }
        }

        stage('Build & Package') {
            steps {
                echo 'Compiling TypeScript...'
                sh 'npm run build'

                echo 'Pruning dev dependencies for production...'
                sh 'npm prune --omit=dev'

                // We no longer zip a tar.gz! Instead, we build a Docker image.
                echo 'Building Docker image...'
                sh 'docker build -t jenkins-express-dummy:latest .'
            }
        }

        stage('Approval') {
            when {
                beforeInput true
                allOf {
                    branch 'main'
                    not { changeRequest() } // Explicitly tells Jenkins: DO NOT run this if it's a PR
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
                // 1. Remove the old container if it exists (so ports don't clash)
                // The "|| true" prevents the pipeline from failing on the very first run when no container exists yet.
                sh 'docker rm -f my-express-prod || true'

                // 2. Run the new container, mapping Windows port 3000 to Container port 3000
                // We inject the API_KEY environment variable directly into the container!
                sh 'docker run -d --name my-express-prod -p 3000:3000 -e API_KEY=${API_KEY} jenkins-express-dummy:latest'
            }
        }
    }

    post {
        always {
            // Jenkins will always read the test results, even if the pipeline failed
            junit 'test-results.xml'
        }
        success {
            // Jenkins will only save the artifact if the build and tests passed
            archiveArtifacts artifacts: 'express-app.tar.gz', fingerprint: true
        }
    }
}

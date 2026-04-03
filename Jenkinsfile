pipeline {
    agent any

    tools {
        nodejs 'node24'
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

        stage('Build') {
            steps {
                echo 'Building the Express application...'
                sh 'npm ci'
                // Here we zip up the app so it's ready for deployment
                sh 'tar -czf express-app.tar.gz index.js package.json node_modules/'

                sh 'node index.js &'
                sh 'sleep 3' // Wait 3 seconds to let it print
            }
        }

        stage('Test') {
            steps {
                echo 'Running unit tests...'
                sh 'npm test'
            }
        }

        stage('Approval') {
            when {
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
                    not { changeRequest() } // Explicitly tells Jenkins: DO NOT run this if it's a PR
                }
            }
            steps {
                echo 'Deploying to staging environment...'
                sh 'echo "App successfully deployed!"'
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

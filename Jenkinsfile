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
                // 1. Install ALL dependencies (so we have TypeScript compiler available)
                sh 'npm ci'

                // 2. Compile TS to JS (This creates the /dist folder with the final script)
                sh 'npm run build'

                // 3. Strip away all devDependencies (Mocha, TS, etc.) to prepare for prod
                sh 'npm prune --omit=dev'

                // 4. Zip ONLY the necessary production files into our Artifact
                sh 'tar -czf express-app.tar.gz dist/ package.json node_modules/'
            }
        }

        stage('Test') {
            steps {
                echo 'Running unit tests...'
                sh 'npm ci'
                sh 'npm test'
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

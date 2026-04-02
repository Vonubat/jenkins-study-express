pipeline {
    agent any

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
                sh 'echo "Pretending to run: npm install"'
            }
        }
        stage('Test') {
            steps {
                echo 'Running unit tests...'
                sh 'echo "Pretending to run: npm test"'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying to staging environment...'
                sh 'echo "App successfully deployed!"'
            }
        }
    }
}
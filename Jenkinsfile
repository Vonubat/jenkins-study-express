pipeline {
    agent any

    environment {
        API_KEY = credentials('prod-api-key')
        TELEGRAM_TOKEN = credentials('telegram-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
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

        stage('Build Image') {
            steps {
                echo 'Building local Docker image...'
                sh 'docker build -t jenkins-express-dummy:latest .'
            }
        }

        stage('Push to Docker Hub') {
            when {
                allOf {
                    branch 'main'
                    not { changeRequest() }
                }
            }
            steps {
                script {
                    env.APP_VERSION = sh(script: "grep '\"version\"' package.json | cut -d '\"' -f4 | head -n 1", returnStdout: true).trim()
                    echo "Detected application version: ${env.APP_VERSION}"
                }

                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    echo 'Logging into Docker Hub...'
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                    echo 'Tagging image with "latest" AND specific version...'
                    sh 'docker tag jenkins-express-dummy:latest ${DOCKER_USER}/jenkins-express-dummy:latest'
                    sh 'docker tag jenkins-express-dummy:latest ${DOCKER_USER}/jenkins-express-dummy:${APP_VERSION}'

                    echo 'Pushing both tags to Docker Hub!'
                    sh 'docker push ${DOCKER_USER}/jenkins-express-dummy:latest'
                    sh 'docker push ${DOCKER_USER}/jenkins-express-dummy:${APP_VERSION}'
                }
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
                message 'Image pushed to Docker Hub! Deploy to Prod?'
                ok 'Deploy'
            }
            steps {
                echo 'Approval granted!'
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
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    echo "Deploying version ${APP_VERSION} from the Registry..."
                    sh 'docker rm -f my-express-prod || true'

                    sh 'docker run -d --name my-express-prod -p 3000:3000 -e API_KEY=${API_KEY} ${DOCKER_USER}/jenkins-express-dummy:${APP_VERSION}'
                }
            }
        }
    }

    post {
        always {
            junit 'test-results.xml'
        }
        success {
            echo 'Sending success notification to Telegram...'
            sh '''
                curl -s -X POST https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage \
                -d chat_id=$TELEGRAM_CHAT_ID \
                -d parse_mode=Markdown \
                -d text="✅ *Build SUCCESS* ✅%0A*Project:* $JOB_NAME%0A*Build ID:* #$BUILD_NUMBER%0A*Branch:* $BRANCH_NAME"
            '''
        }
        failure {
            echo 'Sending failure notification to Telegram...'
            sh '''
                curl -s -X POST https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage \
                -d chat_id=$TELEGRAM_CHAT_ID \
                -d parse_mode=Markdown \
                -d text="🚨 *Build FAILED* 🚨%0A*Project:* $JOB_NAME%0A*Build ID:* #$BUILD_NUMBER%0A*Branch:* $BRANCH_NAME%0ACheck Jenkins for logs!"
            '''
        }
    }
}

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export default () => ({
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/cugetreg',
  port: parseInt(process.env.PORT, 10) || 3000,
  origin: process.env.CORS_ORIGIN || '*',
  googleOAuthId: process.env.GOOGLE_OAUTH_ID,
  googleOAuthSecret: process.env.GOOGLE_OAUTH_SECRET,
  backendPublicUrl: process.env.BACKEND_PUBLIC_URL,
  jwtSecret: process.env.JWT_SECRET,
  adminToken: process.env.ADMIN_TOKEN,
  clientLoggerUrl: process.env.CLIENT_LOGGER_URL,
  computationBackendUrl: process.env.COMPUTATION_BACKEND_URL,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  env: process.env.ENV || 'development',
})

const requiredConfigs = [
  'googleOAuthId',
  'googleOAuthSecret',
  'jwtSecret',
  'adminToken',
  'clientLoggerUrl',
  'computationBackendUrl',
  'backendPublicUrl',
  'slackWebhookUrl',
]

export function validateConfig(configService: ConfigService): void {
  const logger = new Logger('ConfigService')
  for (const key of requiredConfigs) {
    const value = configService.get(key)
    if (!value) {
      logger.error(`Config "${key}" is undefined.`)
    }
  }
}

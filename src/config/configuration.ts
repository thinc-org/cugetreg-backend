import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export default () => ({
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/cugetreg',
  port: parseInt(process.env.PORT, 10) || 3000,
  origin: process.env.CORS_ORIGIN || '*',
  googleOAuthId: process.env.GOOGLE_OAUTH_ID,
  googleOAuthSecret: process.env.GOOGLE_OAUTH_SECRET,
  googleAuthClientId: process.env.GOOGLE_AUTH_CLIENTID,
  jwtSecret: process.env.JWT_SECRET,
  adminToken: process.env.ADMIN_TOKEN,
  isProduction: process.env.IS_PRODUCTION === 'true',
  airtableReviewUrl: process.env.AIRTABLE_REVIEW_URL,
  airtableApiKey: process.env.AIRTABLE_API_KEY,
  clientLoggerUrl: process.env.CLIENT_LOGGER_URL,
})

const requiredConfigs = [
  'googleOAuthId',
  'googleOAuthSecret',
  'googleAuthClientId',
  'jwtSecret',
  'adminToken',
  'airtableReviewUrl',
  'airtableApiKey',
  'clientLoggerUrl',
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

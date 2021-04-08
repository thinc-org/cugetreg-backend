import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export default () => ({
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/cugetreg',
  port: parseInt(process.env.PORT, 10) || 3000,
  googleOAuthId: process.env.GOOGLE_OAUTH_ID,
  googleOAuthSecret: process.env.GOOGLE_OAUTH_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  isProduction: process.env.IS_PRODUCTION === 'true',
  airtableReviewUrl: process.env.AIRTABLE_REVIEW_URL,
  airtableApiKey: process.env.AIRTABLE_API_KEY,
})

const requiredConfigs = [
  'googleOAuthId',
  'googleOAuthSecret',
  'jwtSecret',
  'refreshSecret',
  'airtableReviewUrl',
  'airtableApiKey',
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

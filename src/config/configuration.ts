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
})

export function validateConfig(configService: ConfigService): void {
  const logger = new Logger('ConfigService')
  const config = {
    googleOAuthId: configService.get<string>('googleOAuthId'),
    googleOAuthSecret: configService.get<string>('googleOAuthSecret'),
    jwtSecret: configService.get<string>('jwtSecret'),
    refreshSecret: configService.get<string>('refreshSecret'),
  }
  for (const key in config) {
    if (!config[key]) {
      logger.error(`Config "${key}" is undefined.`)
    }
  }
}

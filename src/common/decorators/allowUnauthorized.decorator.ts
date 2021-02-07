import { SetMetadata } from '@nestjs/common'

export const ALLOW_UNAUTHORIZED_KEY = 'allowUnauthorized'
export const AllowUnauthorized = () => SetMetadata(ALLOW_UNAUTHORIZED_KEY, true)

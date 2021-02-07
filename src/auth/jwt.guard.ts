import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { ALLOW_UNAUTHORIZED_KEY } from 'src/common/decorators/allowUnauthorized.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      ALLOW_UNAUTHORIZED_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }
}

@Injectable()
export class JwtAuthGuardOptional extends AuthGuard(['jwt', 'anonymous']) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}

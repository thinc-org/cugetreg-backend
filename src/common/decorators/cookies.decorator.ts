import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { GraphQLExpressContext } from '../common.type'

export const Cookies = createParamDecorator(
  (cookieName: string, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(
      ctx
    ).getContext<GraphQLExpressContext>()
    return cookieName ? context.req.cookies?.[cookieName] : context.req.cookies
  }
)

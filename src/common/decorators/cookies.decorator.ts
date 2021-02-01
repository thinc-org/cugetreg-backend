import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { GraphQLExpressContext } from '../types/context.type'

export const Cookies = createParamDecorator(
  (cookieName: string, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(
      context
    ).getContext<GraphQLExpressContext>()
    return cookieName
      ? gqlContext.req.cookies?.[cookieName]
      : gqlContext.req.cookies
  }
)

import { Request, Response } from 'express'

export interface GraphQLInitialContext {
  req: Request
  res: Response
}

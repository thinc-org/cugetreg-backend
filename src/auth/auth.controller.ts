import { Controller, Get, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { ParseKeyValuePipe } from 'src/common/pipes/keyvalue.pipe'

@Controller('auth')
export class AuthController {
  @Get('/callback')
  callback(
    @Query('code') code: string,
    @Query('state', ParseKeyValuePipe) state: Record<string, string>,
    @Res() res: Response
  ): void {
    const returnURI = state['returnURI']
    res.redirect(`${returnURI}?code=${code}`)
  }
}

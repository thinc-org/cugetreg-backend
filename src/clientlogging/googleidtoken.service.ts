import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client, TokenPayload } from 'google-auth-library'

@Injectable()
export class GoogleIdTokenService {
  private client: OAuth2Client
  private clientId: string

  constructor(readonly configService: ConfigService) {
    this.clientId = configService.get<string>('googleAuthClientId')
    this.client = new OAuth2Client(this.clientId)
  }

  async verify(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    })
    return ticket.getPayload()
  }
}

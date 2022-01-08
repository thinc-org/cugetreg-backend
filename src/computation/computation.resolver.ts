import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Query, Resolver } from '@nestjs/graphql'
import {
  CourseRecommendationRequest,
  CourseRecommendationResponse,
} from 'src/graphql'

@Resolver('Computation')
export class ComputationResolver {
  private metadata: grpc.Metadata

  private courseRecommendation: any

  constructor(configService: ConfigService) {
    const pkgDef = protoloader.loadSync(
      __dirname + '/../../src/computation/cgrcompute.proto',
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    )
    const descriptor = grpc.loadPackageDefinition(pkgDef)

    const credential = configService.get('computationBackendCredential')
    const clientArgs = [
      configService.get('computationBackendUrl'),
      credential
        ? grpc.credentials.createSsl()
        : grpc.credentials.createInsecure(),
    ]
    this.metadata = new grpc.Metadata()
    if (credential) {
      this.metadata.set(
        'cookie',
        'authelia_session=' +
          configService.get('computationBackendAuthToken') +
          ';'
      )
    }

    this.courseRecommendation = new (descriptor.CourseRecommendation as any)(
      ...clientArgs
    )
  }

  @Query('recommend')
  recommend(
    @Args('req') req: CourseRecommendationRequest
  ): Promise<CourseRecommendationResponse> {
    return new Promise((resolve, reject) => {
      this.courseRecommendation.Recommend(req, this.metadata, (err, res) => {
        if (err) {
          Logger.error('Fail to get course recommendation ', {
            err,
            req,
          })
          reject(new Error('Computation Backend Error'))
        }
        resolve(res)
      })
    })
  }
}

import { Test, TestingModule } from '@nestjs/testing'
import { GenedService } from './gened.service'

describe('GenedService', () => {
  let service: GenedService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenedService],
    }).compile()

    service = module.get<GenedService>(GenedService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

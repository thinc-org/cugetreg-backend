import { Test, TestingModule } from '@nestjs/testing'
import { GenedResolver } from './gened.resolver'
import { GenedService } from './gened.service'

describe('GenedResolver', () => {
  let resolver: GenedResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenedResolver, GenedService],
    }).compile()

    resolver = module.get<GenedResolver>(GenedResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})

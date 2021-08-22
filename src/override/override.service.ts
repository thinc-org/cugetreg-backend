import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { OverrideInput } from 'src/graphql'
import { Override, OverrideDocument } from 'src/schemas/override.schema'

@Injectable()
export class OverrideService {
  constructor(
    @InjectModel('override')
    private overrideModel: Model<OverrideDocument>
  ) {}

  async getOverrides(): Promise<Override[]> {
    const result = await this.overrideModel.find().lean()
    return result
  }

  async createOrUpdateOverride(override: OverrideInput): Promise<Override> {
    const result = await this.overrideModel
      .findOneAndUpdate(
        {
          courseNo: override.courseNo,
        },
        override,
        {
          new: true,
          upsert: true,
        }
      )
      .lean()
    return result
  }

  async deleteOverride(courseNo: string): Promise<Override> {
    const result = await this.overrideModel.findOneAndDelete({ courseNo })
    return result
  }
}

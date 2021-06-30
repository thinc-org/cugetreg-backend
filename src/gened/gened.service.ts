import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { GenEdDocument } from 'src/schemas/gened.schema'
import { GenEdInputDTO } from './dto/gened.dto'

@Injectable()
export class GenedService {
  constructor(
    @InjectModel('genedtype') private genEdTypeModel: Model<GenEdDocument>
  ) {}

  async createOrUpdate(genEdInputDTO: GenEdInputDTO): Promise<GenEdDocument> {
    let document = await this.genEdTypeModel.findOne({
      courseNo: genEdInputDTO.courseNo,
    })
    if (!document) {
      document = await this.genEdTypeModel.create(genEdInputDTO)
    } else {
      document.genEdType = genEdInputDTO.genEdType
      document.sections = genEdInputDTO.sections
    }
    await document.save()
    return document
  }

  async remove(courseNo: string): Promise<GenEdDocument> {
    return this.genEdTypeModel.findOneAndDelete({
      courseNo,
    })
  }
}

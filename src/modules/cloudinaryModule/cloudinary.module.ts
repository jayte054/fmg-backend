import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinaryService/cloudinary.service';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}

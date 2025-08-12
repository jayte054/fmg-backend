import { Injectable } from '@nestjs/common';
import { cloudinary } from '../cloudinaryConfig/cloudinaryConfig';
import { CloudinaryResponse } from '../cloudinaryResponse/cloudinary.response';

export { cloudinary };
@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    if (!file || !file.buffer) {
      throw new Error('File buffer is missing');
    }

    const byteArrayBuffer = file.buffer;

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            width: 500, // Set desired width
            height: 500, // Set desired height
            crop: 'fill', // Ensures the image is resized and cropped to fit
          }, // Ensures it's processed as an image
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as CloudinaryResponse);
            }
          },
        )
        .end(byteArrayBuffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new Error('no files provided');
    }

    return Promise.all(files.map((file) => this.uploadImage(file)));
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

import { v2 as cloudinary } from 'cloudinary';
import { Cloudinary_Api_Key, Cloudinary_Api_Secret, Cloud_Name } from '.';

cloudinary.config({
  cloud_name: Cloud_Name,
  api_key: Cloudinary_Api_Key,
  api_secret: Cloudinary_Api_Secret,
});

export { cloudinary };

import { config } from 'dotenv';

config();
export const Gmail_User = process.env.Mail_User;
export const Gmail_Password = process.env.Mail_Password;
export const Cloud_Name = process.env.Cloud_Name;
export const Cloudinary_Api_Key = process.env.Api_Key;
export const Cloudinary_Api_Secret = process.env.Api_Secret;

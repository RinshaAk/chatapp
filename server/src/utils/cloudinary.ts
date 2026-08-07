import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env.js';

if (ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
  });
}

export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, folder = 'pulsechat'): Promise<any> => {
  if (!ENV.CLOUDINARY_CLOUD_NAME) {
    // Fallback data URI for local dev if Cloudinary keys are not provided
    const base64 = fileBuffer.toString('base64');
    const mimeType = fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream';
    return {
      url: `data:${mimeType};base64,${base64}`,
      public_id: `local_${Date.now()}`
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: `${Date.now()}_${fileName}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

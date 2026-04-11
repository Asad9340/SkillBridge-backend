import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import AppError from '../errorHelpers/AppError';
import { envVars } from './env.config';

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

const assertCloudinaryConfig = () => {
  if (
    !envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME ||
    !envVars.CLOUDINARY.CLOUDINARY_API_KEY ||
    !envVars.CLOUDINARY.CLOUDINARY_API_SECRET
  ) {
    throw new AppError(
      500,
      'Cloudinary environment variables are missing. Configure CLOUDINARY_* values.',
    );
  }
};

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  assertCloudinaryConfig();

  if (!buffer || !fileName) {
    throw new AppError(
      400,
      'File buffer and file name are required for Cloudinary upload.',
    );
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  const fileNameWithoutExtension = fileName
    .split('.')
    .slice(0, -1)
    .join('.')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  const uniqueName = `${Math.random().toString(36).slice(2)}-${Date.now()}-${fileNameWithoutExtension}`;
  const folder = extension === 'pdf' ? 'pdfs' : 'images';

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'auto',
          public_id: `skill-bridge/${folder}/${uniqueName}`,
          folder: `skill-bridge/${folder}`,
        },
        (error, result) => {
          if (error) {
            reject(new AppError(500, 'Failed to upload file to Cloudinary.'));
            return;
          }
          resolve(result as UploadApiResponse);
        },
      )
      .end(buffer);
  });
};

export const deleteFileFromCloudinary = async (url: string) => {
  if (!url) {
    return;
  }

  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);

    if (match?.[1]) {
      await cloudinary.uploader.destroy(match[1], {
        resource_type: 'image',
      });
    }
  } catch {
    throw new AppError(500, 'Failed to delete file from Cloudinary.');
  }
};

export const cloudinaryUpload = cloudinary;

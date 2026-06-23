import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { ensureCloudinaryConfigured } from './cloudinary';

// Ensure cloudinary is configured before creating storage
ensureCloudinaryConfigured();

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Call this again to ensure it's configured
    ensureCloudinaryConfigured();
    return {
      folder: 'profile-pictures',
      allowed_formats: ['jpg', 'png', 'jpeg'],
    };
  },
});
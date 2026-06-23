import { v2 as cloudinary } from 'cloudinary';

// Lazy initialization - will be called when first needed
let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary credentials are missing!');
    console.error('CLOUDINARY_CLOUD_NAME =', cloudName);
    console.error('CLOUDINARY_API_KEY =', apiKey);
    console.error('CLOUDINARY_API_SECRET =', apiSecret);
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  console.log('✓ Cloudinary configured successfully');
  isConfigured = true;
};

// Initialize immediately with a small delay to allow .env to be loaded
setTimeout(ensureCloudinaryConfigured, 100);

export default cloudinary;
export { ensureCloudinaryConfigured };
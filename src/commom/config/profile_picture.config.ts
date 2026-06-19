import { diskStorage } from 'multer';

export const profilePictureUploadConfig = {
  storage: diskStorage({
    destination: './uploads/profile-pictures',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
};
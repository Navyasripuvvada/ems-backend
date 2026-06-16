
import { diskStorage } from 'multer';

export const faceUploadConfig = {
  storage: diskStorage({
    destination: './uploads/faces',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
};
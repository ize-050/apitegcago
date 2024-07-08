import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req:Request, file:any, cb) => {
    cb(null, 'public/product'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename files to avoid conflicts
  }
});

const upload = multer({ storage: storage });


export  default upload
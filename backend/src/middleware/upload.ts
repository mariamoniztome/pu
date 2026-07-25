import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});

// Separate, stricter instance for branding logos / avatars. Own directory,
// image-only mimes (SVG deliberately excluded — it's XSS-capable and this
// directory is served statically), small size cap.
const imageDir = path.join(uploadDir, 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Image type not allowed: ${file.mimetype}`));
  }
};

export const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

const MAGIC_BYTES: { signature: number[]; offset?: number }[] = [
  { signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }, // PNG
  { signature: [0xff, 0xd8, 0xff] }, // JPEG
  { signature: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF (WEBP container, checked together with WEBP tag below)
];

/**
 * multer's fileFilter only trusts the client-supplied Content-Type header,
 * which is trivial to spoof. This reads the file's actual leading bytes
 * after upload and deletes it if they don't match a real image format.
 * Returns true if the file is a genuine PNG/JPEG/WEBP.
 */
export function isGenuineImage(filePath: string): boolean {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(12);
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  const isPng = MAGIC_BYTES[0].signature.every((byte, i) => buffer[i] === byte);
  const isJpeg = MAGIC_BYTES[1].signature.every((byte, i) => buffer[i] === byte);
  const isWebp =
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  return isPng || isJpeg || isWebp;
}

export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `Maximum file size is ${maxFileSize / (1024 * 1024)}MB`,
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
    });
  }
  next();
};

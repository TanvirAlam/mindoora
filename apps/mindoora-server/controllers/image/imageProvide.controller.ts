import { Request, Response } from 'express'
import sanitizeFilename from 'sanitize-filename';
import mime from 'mime-types';
import path from 'path';

export const imageProvideController = async (req: Request, res: Response) => {
  let { filename } = req.params;

  filename = sanitizeFilename(filename);

  if (!filename) {
    return res.status(400).json({ message: 'File Name Not Found' });
  }

  const imageDirectory = './uploads';

  const filePath = path.join(imageDirectory, filename);
  const fileMimeType = mime.lookup(filePath);

  if (!fileMimeType || !fileMimeType.startsWith('image/')) {
    return res.status(404).send('Image not found');
  }

  res.status(200).sendFile(filename, { root: imageDirectory }, (err) => {
    if (err) {
      console.error(`Error serving image: ${err.message}`);
      res.status(404).send('Image not found');
    }
  });
};

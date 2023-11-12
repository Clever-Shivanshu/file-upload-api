// pages/api/upload.js
import formidable from 'formidable-serverless';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS for all routes
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const form = new formidable.IncomingForm();
      form.uploadDir = path.join(process.cwd(), 'public/uploads');

      const data = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      const originalFilename = data.files.file.name;
      const fileExtension = path.extname(originalFilename);
      const timestamp = new Date().getTime();
      const newFilename = `${timestamp}-${originalFilename}`;

      const oldPath = data.files.file.path;
      const newPath = path.join(process.cwd(), 'public', 'uploads', newFilename);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error('Error moving file:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const publicUrl = `/uploads/${newFilename}`;
        console.log('File uploaded successfully:', publicUrl);

        return res.status(200).json({ url: publicUrl });
      });
    } catch (error) {
      console.error('Error handling file upload:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}


// src/pages/api/get-presign.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { filename, contentType } = req.body;
  const key = `uploads/${Date.now()}-${filename}`;

  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Expires: 60 * 10,
      ContentType: contentType || 'video/mp4',
      ACL: 'private'
    });

    // public get URL (if you have public bucket or CloudFront)
    const publicUrl = `${process.env.NEXT_PUBLIC_S3_BASE}/${key}`;

    res.status(200).json({ uploadUrl: url, key, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Presign failed' });
  }
}

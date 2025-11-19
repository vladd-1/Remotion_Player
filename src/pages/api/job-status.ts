// src/pages/api/job-status.ts
import type {NextApiRequest, NextApiResponse} from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const { transcriptId } = req.query;
  try {
    const r = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { authorization: process.env.ASSEMBLY_API_KEY! }
    });
    return res.status(200).json(r.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'status check failed' });
  }
}

// src/pages/api/transcribe-assembly.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const ASSEMBLY = 'https://api.assemblyai.com/v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { audioUrl, jobId, language } = req.body;

  try {
    // 1) Create transcription
    const create = await axios.post(`${ASSEMBLY}/transcript`, {
      audio_url: audioUrl,
      language_code: language || 'en',
      // request word-level timestamps for karaoke (optional)
      // "auto_chapters": false,
      // "iab_categories": false,
      // check AssemblyAI docs for latest flags
      // "speaker_labels": true
    }, {
      headers: { authorization: process.env.ASSEMBLY_API_KEY!, 'content-type': 'application/json' }
    });

    // Return transcript id for polling on client/worker
    res.status(200).json({ transcriptId: create.data.id, url: create.data.audio_url });
  } catch (err: any) {
    console.error(err?.response?.data || err);
    res.status(500).json({ error: 'AssemblyAI create failed' });
  }
}

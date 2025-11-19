// src/components/UploadForm.tsx
import React, { useRef, useState } from 'react';
import axios from 'axios';

type Props = {
  onUploaded: (publicUrl: string, duration: number) => void;
  onCaptions: (captions: any[]) => void;
};

export default function UploadForm({ onUploaded, onCaptions }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert('Pick an mp4');
    setUploading(true);

    // 1) get presign
    const presign = await axios.post('/api/get-presign', { filename: file.name, contentType: file.type });
    const { uploadUrl, key, publicUrl } = presign.data;

    // 2) PUT file to S3 presigned
    await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

    // 3) estimate duration by creating a local blob URL and reading metadata
    const blobUrl = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.src = blobUrl;
    await new Promise((resolve) => { videoEl.onloadedmetadata = resolve; });
    const duration = videoEl.duration;

    setVideoUrl(publicUrl);
    onUploaded(publicUrl, duration);

    setUploading(false);
  }

  async function handleAutoCaptions() {
    if (!videoUrl) return alert('Upload first');
    setUploading(true);
    // Request AssemblyAI transcription
    const create = await axios.post('/api/transcribe-assembly', { audioUrl: videoUrl });
    const transcriptId = create.data.transcriptId;

    // poll status
    let done = false;
    let result: any = null;
    while (!done) {
      await new Promise(r => setTimeout(r, 2500));
      const status = await axios.get('/api/job-status', { params: { transcriptId } });
      if (status.data.status === 'completed') { done = true; result = status.data; }
      else if (status.data.status === 'error') { done = true; result = status.data; }
    }

    // AssemblyAI returns segments; convert to simple caption array
    const captions = (result.words || result.sentences || result.results || []).map((s: any) => ({
      start: s.start / 1000.0,
      end: s.end / 1000.0,
      text: s.text || s.word
    }));

    onCaptions(captions);
    setUploading(false);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <input ref={fileRef} type="file" accept="video/mp4" />
      <button onClick={handleUpload} disabled={uploading}>Upload</button>
      <button onClick={handleAutoCaptions} disabled={uploading || !videoUrl}>Auto-generate captions</button>
    </div>
  );
}

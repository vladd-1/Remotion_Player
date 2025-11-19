// src/pages/index.tsx
import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import CaptionPreview from '../components/CaptionPreview';

export default function Home() {
  const [videoPublicUrl, setVideoPublicUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [duration, setDuration] = useState<number>(0);

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <h1>Remotion Captioning Platform</h1>
      <UploadForm
        onUploaded={(publicUrl, dur) => { setVideoPublicUrl(publicUrl); setDuration(dur); }}
        onCaptions={(c) => setCaptions(c)}
      />
      {videoPublicUrl && (
        <CaptionPreview
          videoUrl={videoPublicUrl}
          captions={captions}
          duration={duration}
        />
      )}
    </div>
  );
}

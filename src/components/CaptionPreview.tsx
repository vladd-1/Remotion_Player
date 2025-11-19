// src/components/CaptionPreview.tsx
import React from 'react';
import { Player } from '@remotion/player';
import CaptionComposition from '../remotion/CaptionComposition';

type Props = { videoUrl: string; captions: any[]; duration: number };

export default function CaptionPreview({ videoUrl, captions, duration }: Props) {
  const fps = 30;
  const durationFrames = Math.ceil(duration * fps);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Preview</h3>
      <div style={{ width: 800, height: 450 }}>
        <Player
          autoPlay
          loop
          component={CaptionComposition}
          durationInFrames={durationFrames}
          compositionWidth={1280}
          compositionHeight={720}
          fps={fps}
          inputProps={{ captions, videoUrl, preset: 'bottom' }}
        />
      </div>
      <p>Use "Export" in the UI to trigger server-side Remotion render (worker)</p>
    </div>
  );
}

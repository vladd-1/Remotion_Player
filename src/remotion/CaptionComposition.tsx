// src/remotion/CaptionComposition.tsx
import React from 'react';
import {AbsoluteFill, Composition, Video, useCurrentFrame} from 'remotion';
import { registerFont } from 'remotion';

// register fonts (ensure font files exist under public/fonts)
registerFont({ family: 'Noto Sans', src: '/fonts/NotoSans-Regular.ttf' });
registerFont({ family: 'Noto Sans Devanagari', src: '/fonts/NotoSansDevanagari-Regular.ttf' });

type Caption = { start: number; end: number; text: string };

export const CaptionLayer: React.FC<{captions: Caption[], videoUrl: string, preset: string}> = ({ captions, videoUrl, preset }) => {
  const frame = useCurrentFrame();
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Video src={videoUrl} />
      {captions.map((c, i) => {
        const startF = Math.floor(c.start * fps);
        const endF = Math.floor(c.end * fps);
        const visible = frame >= startF && frame <= endF;
        if (!visible) return null;

        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          textShadow: '0 3px 8px rgba(0,0,0,0.7)',
          color: '#fff'
        };

        if (preset === 'topbar') {
          return (
            <div key={i} style={{ ...baseStyle, top: 0, padding: 12, fontSize: 34, background: 'rgba(0,0,0,0.5)' }}>
              {c.text}
            </div>
          );
        } else if (preset === 'karaoke') {
          return (
            <div key={i} style={{ ...baseStyle, bottom: 80, fontSize: 48 }}>
              {c.text}
            </div>
          );
        } else {
          // bottom-centered
          return (
            <div key={i} style={{ ...baseStyle, bottom: 40, fontSize: 36, padding: '6px 20px', background: 'rgba(0,0,0,0.35)', display: 'inline-block', margin: '0 auto', borderRadius: 6 }}>
              {c.text}
            </div>
          );
        }
      })}
    </AbsoluteFill>
  );
};

// index exports composition for remotion player & render
export const RemotionIndex: React.FC = () => null;

// For Remotion CLI, export composition named "CaptionComp" from a file that Remotion reads
export const CaptionComp: React.FC<any> = ({ inputProps }) => {
  const { captions = [], videoUrl = '', preset = 'bottom' } = inputProps;
  return <CaptionLayer captions={captions} videoUrl={videoUrl} preset={preset} />;
};

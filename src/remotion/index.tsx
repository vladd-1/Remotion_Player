// src/remotion/index.tsx
import { Composition } from 'remotion';
import { CaptionComp } from './CaptionComposition';

export const RemotionCompositions = () => {
  return (
    <>
      <Composition
        id="CaptionComp"
        component={CaptionComp}
        durationInFrames={300} // overridden by inputProps during render
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          captions: [],
          videoUrl: '',
          preset: 'bottom'
        }}
      />
    </>
  );
};

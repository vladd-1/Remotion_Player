// src/utils/srt.ts
export function toSrt(captions: {start: number, end: number, text: string}[]) {
  function format(ts: number) {
    const h = Math.floor(ts / 3600);
    const m = Math.floor((ts % 3600) / 60);
    const s = Math.floor(ts % 60);
    const ms = Math.floor((ts - Math.floor(ts)) * 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  }

  return captions.map((c, i) => `${i+1}\n${format(c.start)} --> ${format(c.end)}\n${c.text}\n`).join('\n');
}

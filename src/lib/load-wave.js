import { WaveFile } from 'wavefile';
import audioBufferToWav from 'audiobuffer-to-wav';

export function uploadWave(file) {
  return new Promise(async (resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', () => {
      const wav = new WaveFile();
      try {
        wav.fromBuffer(new Uint8Array(reader.result));
        wav.toBitDepth(8);
        wav.toSampleRate(11025);
      } catch (err) {
        reject(err);
      }
      resolve(wav);
    });
  });
}

export function loadWaveFromData(data) {
  const wav = new WaveFile();
  wav.fromBase64(data.data);
  return wav;
}

export async function loadWaveFromBlob(blob) {
  const wav = new WaveFile();
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
  wav.fromBuffer(new Uint8Array(audioBufferToWav(buffer)));
  wav.toBitDepth(8);
  wav.toSampleRate(11025);
  return wav;
}

export async function loadWave(src) {
  const res = await fetch(src, {});
  const buffer = await res.arrayBuffer();
  const wav = new WaveFile();
  wav.fromBuffer(new Uint8Array(buffer));
  return wav;
}

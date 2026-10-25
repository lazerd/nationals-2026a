import { spawn } from 'node:child_process';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

// Runs ffmpeg. If `duration` is given, reports progress as a 0..1 fraction.
export function ffmpeg(args, { duration, onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const full = ['-hide_banner', '-nostdin', '-y', '-loglevel', 'error', '-progress', 'pipe:1', ...args];
    const proc = spawn(FFMPEG, full, { signal });
    let stderr = '';
    let buf = '';
    proc.stdout.on('data', (d) => {
      buf += d;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        const m = line.match(/^out_time_us=(\d+)/);
        if (m && duration && onProgress) onProgress(Math.min(1, Number(m[1]) / 1e6 / duration));
      }
    });
    proc.stderr.on('data', (d) => { stderr = (stderr + d).slice(-8000); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with ${code}: ${stderr.trim().split('\n').slice(-5).join(' | ')}`));
    });
  });
}

export function probe(file) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { err += d; });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffprobe failed: ${err.trim()}`));
      const json = JSON.parse(out);
      const video = json.streams.find((s) => s.codec_type === 'video');
      const audio = json.streams.find((s) => s.codec_type === 'audio');
      if (!video) return reject(new Error('No video stream found in this file.'));
      // Phone footage is often stored landscape with a rotation flag.
      const rotation = Math.abs(Number(
        video.tags?.rotate ?? video.side_data_list?.find((s) => s.rotation !== undefined)?.rotation ?? 0,
      ));
      const swap = rotation === 90 || rotation === 270;
      const [num, den] = (video.avg_frame_rate || '30/1').split('/').map(Number);
      resolve({
        duration: Number(json.format.duration || video.duration || 0),
        width: swap ? video.height : video.width,
        height: swap ? video.width : video.height,
        fps: den ? num / den : 30,
        hasAudio: Boolean(audio),
      });
    });
  });
}

// Streams raw ffmpeg output to `onChunk` without buffering the whole file.
export function ffmpegStream(args, onChunk, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, ['-hide_banner', '-nostdin', '-loglevel', 'error', ...args, 'pipe:1'], { signal });
    let stderr = '';
    proc.stdout.on('data', onChunk);
    proc.stderr.on('data', (d) => { stderr = (stderr + d).slice(-4000); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with ${code}: ${stderr.trim()}`));
    });
  });
}

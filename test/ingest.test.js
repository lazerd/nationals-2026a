import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFromHtml, playersFromTitle, findTimedSegments, assertPublicUrl } from '../lib/ingest.js';

const BASE = 'https://swing.vision/matches/abc123';

test('reads og:video and escaped JSON video URLs', () => {
  const html = `<html><head>
    <meta property="og:title" content="SwingVision: Jane Doe and My Partner vs Alex Kim and Opponent 2">
    <meta property="og:video" content="https://cdn.example.com/v/abc.mp4?sig=1&amp;x=2">
    <meta property="og:image" content="https://cdn.example.com/v/abc.jpg">
    </head><body><script>self.__next_f.push([1,"{\\"hlsUrl\\":\\"https:\\/\\/stream.example.com\\/abc\\/master.m3u8\\"}"])</script></body></html>`;
  const info = extractFromHtml(html, BASE);
  assert.deepEqual(info.videoUrls, [
    'https://stream.example.com/abc/master.m3u8',
    'https://cdn.example.com/v/abc.mp4?sig=1&x=2',
  ]);
  assert.deepEqual(info.players, ['Jane Doe', 'Alex Kim']);
  assert.equal(info.thumbnail, 'https://cdn.example.com/v/abc.jpg');
});

test('reads <video>/<source> tags with relative URLs', () => {
  const info = extractFromHtml('<video><source src="/media/x.mp4" type="video/mp4"></video>', BASE);
  assert.deepEqual(info.videoUrls, ['https://swing.vision/media/x.mp4']);
});

test('finds no video on a page without one', () => {
  assert.deepEqual(extractFromHtml('<html><title>Sign in</title></html>', BASE).videoUrls, []);
});

test('player names from titles', () => {
  assert.deepEqual(playersFromTitle('SwingVision: Sam Lee vs Pat Ray'), ['Sam Lee', 'Pat Ray']);
  assert.deepEqual(playersFromTitle('Practice session'), []);
});

test('finds point timestamps in embedded JSON, in ms or s', () => {
  const json = { props: { match: { points: [
    { id: 1, startTime: 12000, endTime: 21000, shots: [1, 2, 3] },
    { id: 2, startTime: 40000, endTime: 52000, shots: [1, 2, 3, 4, 5] },
    { id: 3, startTime: 70000, endTime: 75000, shots: [1] },
  ] } } };
  assert.deepEqual(findTimedSegments(json), [
    { start: 12, end: 21, shots: 3 },
    { start: 40, end: 52, shots: 5 },
    { start: 70, end: 75, shots: 1 },
  ]);
  const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(json)}</script>`;
  assert.equal(extractFromHtml(html, BASE).segments.length, 3);
});

test('rejects private and non-http URLs', async () => {
  await assert.rejects(assertPublicUrl('http://127.0.0.1/x'), /private/);
  await assert.rejects(assertPublicUrl('http://[::1]/x'), /private/);
  await assert.rejects(assertPublicUrl('file:///etc/passwd'), /http/);
  await assert.rejects(assertPublicUrl('not a url'), /link/);
});

const $ = (s) => document.querySelector(s);
const steps = ['import', 'working', 'build', 'result'];
const TARGET_SEC = 50; // auto-pick aims for a reel around a minute long
const MAX_AUTO_CLIPS = 8;

const state = {
  source: null,
  selected: new Set(),
  touched: false, // user edited the selection by hand
  side: 'near',
  mode: 'winners',
  layout: 'focus',
  tapping: false,
  reel: null,
  stopAt: null,
};

function show(name) {
  for (const s of steps) $(`#step-${s}`).hidden = s !== name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fmt(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function setError(el, msg) {
  el.textContent = msg || '';
  el.hidden = !msg;
}

async function api(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

async function poll(url, onTick) {
  for (;;) {
    const data = await api(url);
    if (onTick(data)) return data;
    await new Promise((r) => setTimeout(r, 1200));
  }
}

function working(title, step, progress) {
  $('#working-title').textContent = title;
  $('#working-step').textContent = step || '';
  const bar = $('#working-bar');
  bar.parentElement.classList.toggle('indeterminate', progress == null);
  bar.style.width = progress == null ? '' : `${Math.round(progress * 100)}%`;
}

// ---- import ---------------------------------------------------------------
$('#video').addEventListener('change', (e) => {
  const f = e.target.files[0];
  $('#video-label').textContent = f ? f.name : 'Upload the match video';
  e.target.parentElement.classList.toggle('has', Boolean(f));
});
$('#music').addEventListener('change', (e) => {
  const f = e.target.files[0];
  $('#music-label').textContent = f ? `♪ ${f.name}` : 'Add a music track (optional)';
  e.target.parentElement.classList.toggle('has', Boolean(f));
});

$('#import-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#import-error');
  setError(err, '');
  const url = $('#url').value.trim();
  const file = $('#video').files[0];
  if (!url && !file) return setError(err, 'Paste a SwingVision link or choose a video.');

  const form = new FormData();
  if (file) form.append('video', file);
  else form.append('url', url);

  show('working');
  try {
    let id;
    if (file) {
      id = await uploadWithProgress('/api/sources', form, (p) => working('Uploading video', `${Math.round(p * 100)}%`, p));
    } else {
      working('Importing match', 'Opening link', null);
      ({ id } = await api('/api/sources', { method: 'POST', body: form }));
    }
    history.replaceState(null, '', `#m=${id}`);
    await loadSource(id);
  } catch (ex) {
    show('import');
    setError(err, ex.message);
  }
});

function uploadWithProgress(url, form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status < 300) resolve(body.id);
      else reject(new Error(body.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'));
    xhr.send(form);
  });
}

async function loadSource(id) {
  show('working');
  const s = await poll(`/api/sources/${id}`, (d) => {
    working(d.status === 'downloading' ? 'Importing match' : 'Finding highlights', d.step, null);
    return d.status === 'ready' || d.status === 'error';
  });
  if (s.status === 'error') throw new Error(s.error);
  state.source = s;
  state.touched = false;
  setupBuild();
  show('build');
}

// ---- build ----------------------------------------------------------------
function setupBuild() {
  const s = state.source;
  $('#match-title').textContent = s.info?.title || `${fmt(s.info.duration)} of video · ${s.clips.length} rallies found`;
  const chips = $('#player-chips');
  chips.innerHTML = '';
  for (const name of s.info?.players || []) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = name;
    b.onclick = () => { $('#player').value = name; };
    chips.append(b);
  }
  if (!$('#player').value && s.info?.players?.length === 1) $('#player').value = s.info.players[0];
  const notes = {
    swingvision: 'Points imported from SwingVision.',
    audio: 'Rallies found from the sound of the ball. Tap a clip to preview it, and tap ✓ to include it.',
    even: "This video has no usable audio, so we sampled moments evenly. Scrub the video and use “Add this moment” for the best points.",
  };
  $('#detect-note').textContent = notes[s.detection] || '';
  $('#preview').src = s.previewUrl;
  // Winners need the audio of each strike.
  setMode(s.endings?.length ? 'winners' : 'rallies');
  $('#mode').querySelector('[data-v=winners]').disabled = !s.endings?.length;
  if (s.identify?.status === 'running' || s.identify?.status === 'queued') watchIdentify();
}

function setMode(mode) {
  state.mode = mode;
  for (const b of $('#mode').children) b.classList.toggle('on', b.dataset.v === mode);
  $('#side-wrap').hidden = mode === 'winners';
  $('#me-panel').hidden = mode !== 'winners';
  updateMePanel();
  state.touched = false;
  autoPick();
}

// Moments the user added by hand show up in both lists.
function clipList() {
  if (state.mode !== 'winners') return state.source.clips;
  return [...(state.source.winners || []), ...state.source.clips.filter((c) => c.manual)].sort((a, b) => a.start - b.start);
}

function updateMePanel() {
  const s = state.source;
  const id = s.identify;
  const bar = $('#me-bar');
  const swatch = $('#swatch');
  bar.hidden = !(id && (id.status === 'running' || id.status === 'queued'));
  if (!bar.hidden) bar.firstElementChild.style.width = `${Math.round((100 * id.done) / Math.max(1, id.total))}%`;
  if (s.me?.color) {
    swatch.hidden = false;
    swatch.style.background = `rgb(${s.me.color.r},${s.me.color.g},${s.me.color.b})`;
  }
  const text = $('#me-text');
  if (!bar.hidden) {
    text.innerHTML = `<b>${id.step || 'Working'}…</b> ${id.done}/${id.total} points`;
  } else if (id?.status === 'error') {
    text.innerHTML = `<b>That didn't work:</b> ${id.error}. Try tapping again on a frame where you're clearly visible.`;
  } else if (s.winners) {
    const mine = s.winners.filter((w) => w.likelihood >= 0.5).length;
    text.innerHTML = s.winners.length
      ? `<b>${s.winners.length} points ended by your team.</b> ${mine} look like your shot. Tap a clip to check it, and use ✓ to keep it. Hits into the net or long can show up too, so give them a quick look.`
      : "<b>No points found for you.</b> Try tapping yourself again on a clearer frame, ideally on your shirt.";
    $('#tap-btn').textContent = 'Not me? Tap again';
  }
  $('#tap-btn').disabled = !bar.hidden;
}

async function watchIdentify() {
  updateMePanel();
  const s = await poll(`/api/sources/${state.source.id}`, (d) => {
    state.source.identify = d.identify;
    updateMePanel();
    return d.identify?.status === 'ready' || d.identify?.status === 'error';
  });
  state.source = s;
  updateMePanel();
  state.touched = false;
  if (state.mode === 'winners') autoPick();
}

// Maps a click on the video to 0..1 coordinates inside the actual picture
// (the element letterboxes the video).
function videoPoint(e) {
  const v = $('#preview');
  const rect = v.getBoundingClientRect();
  const scale = Math.min(rect.width / v.videoWidth, rect.height / v.videoHeight);
  const w = v.videoWidth * scale;
  const h = v.videoHeight * scale;
  const x = (e.clientX - rect.left - (rect.width - w) / 2) / w;
  const y = (e.clientY - rect.top - (rect.height - h) / 2) / h;
  return { x, y, px: e.clientX - rect.left, py: e.clientY - rect.top };
}

function setTapping(on) {
  state.tapping = on;
  $('#tap-layer').hidden = !on;
  // The sticky button would cover the bottom of the video, where the near
  // players are.
  document.body.classList.toggle('tapping', on);
  // Native controls also cover the bottom of the picture.
  $('#preview').controls = !on;
  $('#tap-btn').textContent = on ? 'Cancel' : state.source.winners ? 'Not me? Tap again' : 'This is me';
  if (on) $('.stage').scrollIntoView({ behavior: 'instant', block: 'center' });
}

$('#tap-btn').onclick = () => {
  $('#preview').pause();
  setTapping(!state.tapping);
};

$('#tap-layer').addEventListener('click', async (e) => {
  const p = videoPoint(e);
  if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return;
  setTapping(false);
  const dot = $('#tap-dot');
  dot.style.left = `${p.px}px`;
  dot.style.top = `${p.py}px`;
  dot.hidden = false;
  try {
    await api(`/api/sources/${state.source.id}/me`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ t: $('#preview').currentTime, x: p.x, y: p.y }),
    });
    state.source.identify = { status: 'queued', done: 0, total: state.source.endings.length };
    await watchIdentify();
  } catch (ex) {
    setError($('#build-error'), ex.message);
  } finally {
    setTimeout(() => { dot.hidden = true; }, 1500);
  }
});

function scoreOf(c) {
  if (c.manual) return 100;
  return c.winner ? c.likelihood : c[`score_${state.side}`] ?? 0;
}

function autoPick() {
  state.selected = new Set();
  if (state.mode === 'winners') {
    // Keep everything that looks like your shot, up to a ~1 minute reel.
    const ranked = [...clipList()].sort((a, b) => scoreOf(b) - scoreOf(a));
    let total = 0;
    for (const c of ranked) {
      if (scoreOf(c) < 0.5 && state.selected.size >= 3) break;
      if (total + (c.end - c.start) > 75) break;
      state.selected.add(c.id);
      total += c.end - c.start;
    }
    return renderClips();
  }
  const ranked = [...state.source.clips].sort((a, b) => scoreOf(b) - scoreOf(a));
  let total = 0;
  for (const c of ranked) {
    const d = c.end - c.start;
    if (state.selected.size >= MAX_AUTO_CLIPS || total + d > TARGET_SEC + 8) continue;
    state.selected.add(c.id);
    total += d;
    if (total >= TARGET_SEC) break;
  }
  renderClips();
}

function renderClips() {
  const list = $('#clips');
  list.innerHTML = '';
  const items = clipList();
  const top = new Set([...items].sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, items.length > 5 ? 3 : 0).map((c) => c.id));
  for (const c of items) {
    const li = document.createElement('li');
    li.className = `clip${state.selected.has(c.id) ? ' on' : ''}`;
    let badge = top.has(c.id) ? '<span class="badge">TOP</span>' : '';
    if (c.winner) {
      badge = c.likelihood >= 0.6 ? '<span class="badge you">YOU</span>'
        : c.likelihood >= 0.35 ? '<span class="badge maybe">YOU?</span>'
          : '<span class="badge partner">PARTNER?</span>';
    }
    li.innerHTML = `
      ${badge}
      <img loading="lazy" alt="" src="${c.thumb || ''}">
      <button class="tick" type="button" aria-label="Include clip">${state.selected.has(c.id) ? '✓' : '+'}</button>
      <div class="meta"><b>${fmt(c.start)}</b><span>${c.shots ? `${c.shots} shot${c.shots === 1 ? "" : "s"}` : c.manual ? 'added' : ''} · ${Math.round(c.end - c.start)}s</span></div>`;
    li.querySelector('img').onclick = () => playClip(c);
    li.querySelector('.tick').onclick = () => {
      state.touched = true;
      if (state.selected.has(c.id)) state.selected.delete(c.id);
      else state.selected.add(c.id);
      renderClips();
    };
    list.append(li);
  }
  const chosen = items.filter((c) => state.selected.has(c.id));
  const secs = chosen.reduce((n, c) => n + (c.end - c.start), 0);
  $('#selection-summary').textContent = chosen.length ? `${chosen.length} clips · ~${Math.round(secs + 5)}s` : 'No clips yet';
}

function playClip(c) {
  const v = $('#preview');
  v.currentTime = c.start;
  state.stopAt = c.end;
  v.play().catch(() => {});
  v.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
$('#preview').addEventListener('timeupdate', (e) => {
  if (state.stopAt && e.target.currentTime >= state.stopAt) {
    e.target.pause();
    state.stopAt = null;
  }
});
$('#preview').addEventListener('seeking', () => { state.stopAt = null; });

$('#mode').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && !b.disabled && b.dataset.v !== state.mode) setMode(b.dataset.v);
});

for (const group of ['side', 'layout']) {
  $(`#${group}`).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    for (const x of $(`#${group}`).children) x.classList.toggle('on', x === b);
    state[group] = b.dataset.v;
    if (group === 'side' && !state.touched) autoPick();
    else if (group === 'side') renderClips();
  });
}

$('#auto-pick').onclick = () => { state.touched = false; autoPick(); };
$('#clear-pick').onclick = () => { state.touched = true; state.selected.clear(); renderClips(); };
$('#add-moment').onclick = async () => {
  const t = $('#preview').currentTime;
  try {
    const clip = await api(`/api/sources/${state.source.id}/clips`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ start: t - 6, end: t + 2 }),
    });
    state.source.clips.push(clip);
    state.source.clips.sort((a, b) => a.start - b.start);
    state.selected.add(clip.id);
    state.touched = true;
    renderClips();
  } catch (ex) {
    setError($('#build-error'), ex.message);
  }
};

$('#render-btn').onclick = async () => {
  const err = $('#build-error');
  setError(err, '');
  const name = $('#player').value.trim();
  if (!name) { $('#player').focus(); return setError(err, "Enter the player's name."); }
  if (!state.selected.size) return setError(err, 'Pick at least one clip.');

  const form = new FormData();
  form.append('sourceId', state.source.id);
  form.append('clipIds', JSON.stringify([...state.selected]));
  form.append('playerName', name);
  form.append('side', state.side);
  form.append('layout', state.layout);
  form.append('subtitle', $('#subtitle').value);
  form.append('clubName', $('#club').value);
  form.append('replay', String($('#replay').checked));
  const music = $('#music').files[0];
  if (music) form.append('music', music);

  show('working');
  working('Making your reel', 'Cutting clips', 0);
  try {
    const { id } = await api('/api/reels', { method: 'POST', body: form });
    const r = await poll(`/api/reels/${id}`, (d) => {
      working('Making your reel', d.status === 'queued' ? 'Waiting in line' : 'Rendering 1080×1920', d.progress || 0);
      return d.status === 'ready' || d.status === 'error';
    });
    if (r.status === 'error') throw new Error(r.error);
    showResult(r, name);
  } catch (ex) {
    show('build');
    setError(err, ex.message);
  }
};

// ---- result ---------------------------------------------------------------
function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reel';
}

function showResult(r, name) {
  state.reel = r;
  $('#reel').src = `${r.url}#t=1`; // skip the fade-in so the first frame isn't black
  $('#download-btn').href = r.url;
  $('#download-btn').download = `${slug(name)}-highlights.mp4`;
  const club = $('#club').value.trim();
  const sub = $('#subtitle').value.trim();
  const tag = (s) => `#${s.replace(/[^A-Za-z0-9]/g, '')}`;
  $('#caption').value = [
    `🎾 ${name} highlights${sub ? ` · ${sub}` : ''}`,
    '',
    [tag('tennis'), club && tag(club), tag('SwingVision'), tag(`${document.title.split(' ')[0]}`)].filter(Boolean).join(' '),
  ].join('\n');
  // Desktop browsers can't hand a video to Instagram/Facebook; download instead.
  $('#share-btn').hidden = !navigator.canShare;
  show('result');
}

$('#share-btn').onclick = async () => {
  const name = $('#player').value.trim();
  try {
    const blob = await (await fetch(state.reel.url)).blob();
    const file = new File([blob], `${slug(name)}-highlights.mp4`, { type: 'video/mp4' });
    const caption = $('#caption').value;
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.clipboard?.writeText(caption).catch(() => {});
      await navigator.share({ files: [file], title: `${name} highlights`, text: caption });
      return;
    }
  } catch (ex) {
    if (ex.name === 'AbortError') return;
  }
  $('#download-btn').click();
};

$('#copy-caption').onclick = async () => {
  await navigator.clipboard.writeText($('#caption').value);
  $('#copy-caption').textContent = 'Copied ✓';
  setTimeout(() => { $('#copy-caption').textContent = 'Copy caption'; }, 1500);
};
$('#back-btn').onclick = () => show('build');
$('#new-btn').onclick = () => { history.replaceState(null, '', '/'); location.reload(); };

// ---- boot -----------------------------------------------------------------
api('/api/config').then((c) => {
  $('#brand').textContent = c.brand;
  document.title = `${c.brand} Reels`;
}).catch(() => {});

const m = location.hash.match(/m=([\w-]+)/);
if (m) loadSource(m[1]).catch((ex) => { show('import'); setError($('#import-error'), ex.message); });

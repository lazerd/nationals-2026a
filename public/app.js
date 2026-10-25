const $ = (s) => document.querySelector(s);
const steps = ['import', 'working', 'build', 'result'];
const TARGET_SEC = 50; // auto-pick aims for a reel around a minute long
const MAX_AUTO_CLIPS = 8;

const state = {
  source: null,
  selected: new Set(),
  touched: false, // user edited the selection by hand
  side: 'near',
  layout: 'focus',
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
  autoPick();
}

function scoreOf(c) {
  return c[`score_${state.side}`] ?? 0;
}

function autoPick() {
  const ranked = [...state.source.clips].sort((a, b) => scoreOf(b) - scoreOf(a));
  state.selected = new Set();
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
  const top = new Set([...state.source.clips].sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, state.source.clips.length > 5 ? 3 : 0).map((c) => c.id));
  for (const c of state.source.clips) {
    const li = document.createElement('li');
    li.className = `clip${state.selected.has(c.id) ? ' on' : ''}`;
    li.innerHTML = `
      ${top.has(c.id) ? '<span class="badge">TOP</span>' : ''}
      <img loading="lazy" alt="" src="${c.thumb || ''}">
      <button class="tick" type="button" aria-label="Include clip">${state.selected.has(c.id) ? '✓' : '+'}</button>
      <div class="meta"><b>${fmt(c.start)}</b><span>${c.shots ? `${c.shots} shots` : c.manual ? 'added' : ''} · ${Math.round(c.end - c.start)}s</span></div>`;
    li.querySelector('img').onclick = () => playClip(c);
    li.querySelector('.tick').onclick = () => {
      state.touched = true;
      if (state.selected.has(c.id)) state.selected.delete(c.id);
      else state.selected.add(c.id);
      renderClips();
    };
    list.append(li);
  }
  const chosen = state.source.clips.filter((c) => state.selected.has(c.id));
  const secs = chosen.reduce((n, c) => n + (c.end - c.start), 0);
  $('#selection-summary').textContent = `${chosen.length} clips · ~${Math.round(secs + 5)}s`;
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

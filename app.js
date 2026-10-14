// public/app.js
// Lightweight client to fetch data/seed-channels.json and render channels.
// Also provides "Download full M3U" and per-channel "Download M3U" actions.

async function fetchChannels() {
  try {
    const res = await fetch('/data/seed-channels.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('Failed to fetch channel data: ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.channels || []);
  } catch (err) {
    console.error(err);
    return [];
  }
}

function makeM3UFromChannels(channels) {
  const lines = ['#EXTM3U'];
  for (const ch of channels) {
    const name = ch.name || 'Unknown Channel';
    const tvgId = ch.tvgId || name.toLowerCase().replace(/\s+/g, '-');
    const logo = ch.logo || '';
    const group = ch.group || ch.category || 'General';
    const url = ch.url || '';
    lines.push(`#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${name}" tvg-logo="${logo}" group-title="${group}",${name}`);
    lines.push(url);
  }
  return lines.join('\n') + '\n';
}

function downloadText(filename, content) {
  const blob = new Blob([content], {type: 'application/octet-stream'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openInExternal(url) {
  // Attempt to open in same tab; mobile apps like VLC can accept m3u links if the user pastes them.
  // For safety, open in new tab. Some apps support adding playlist from remote URL.
  window.open(url, '_blank', 'noopener');
}

function renderChannels(channels) {
  const container = document.getElementById('channels-list');
  container.innerHTML = '';
  if (!channels.length) {
    container.textContent = 'No channels available.';
    return;
  }

  for (const ch of channels) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'space-between';

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '0.75rem';

    if (ch.logo) {
      const img = document.createElement('img');
      img.src = ch.logo;
      img.alt = ch.name || '';
      img.style.width = '56px';
      img.style.height = '36px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      left.appendChild(img);
    }

    const meta = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = ch.name || 'Unknown Channel';
    title.style.fontWeight = '700';
    const subtitle = document.createElement('div');
    subtitle.textContent = `${ch.group || ch.category || 'General'} — ${ch.tvgId || ''}`;
    subtitle.style.fontSize = '0.88rem';
    subtitle.style.color = '#c7d9eb';
    meta.appendChild(title);
    meta.appendChild(subtitle);

    left.appendChild(meta);
    card.appendChild(left);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';
    const openBtn = document.createElement('button');
    openBtn.className = 'btn primary';
    openBtn.textContent = 'Open';
    openBtn.onclick = () => openInExternal(ch.url);
    const dlBtn = document.createElement('button');
    dlBtn.className = 'btn secondary';
    dlBtn.textContent = 'M3U';
    dlBtn.onclick = () => {
      const m3u = makeM3UFromChannels([ch]);
      downloadText(`${(ch.tvgId || ch.name || 'channel').replace(/\s+/g,'_')}.m3u`, m3u);
    };
    actions.appendChild(openBtn);
    actions.appendChild(dlBtn);
    card.appendChild(actions);

    container.appendChild(card);
  }
}

async function init() {
  const channels = await fetchChannels();
  renderChannels(channels);

  document.getElementById('download-all').addEventListener('click', () => {
    const m3u = makeM3UFromChannels(channels);
    downloadText('personaiptv-all.m3u', m3u);
  });
}

document.addEventListener('DOMContentLoaded', init);

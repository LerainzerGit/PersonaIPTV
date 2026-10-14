const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dataFile = path.join(root, 'data', 'seed-channels.json');
const outputDir = path.join(root, 'playlists');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateM3U(channels) {
  const lines = ['#EXTM3U'];
  for (const channel of channels) {
    const safeName = channel.name || 'Unknown Channel';
    const safeTvgId = channel.tvgId || slugify(safeName);
    const safeLogo = channel.logo || '';
    const safeGroup = channel.group || 'General';
    const streamUrl = channel.url || '';

    lines.push(`#EXTINF:-1 tvg-id="${safeTvgId}" tvg-name="${safeName}" tvg-logo="${safeLogo}" group-title="${safeGroup}",${safeName}`);
    lines.push(streamUrl);
  }
  return `${lines.join('\n')}\n`;
}

function loadChannels() {
  if (!fs.existsSync(dataFile)) {
    throw new Error(`Missing data file: ${dataFile}`);
  }

  const raw = fs.readFileSync(dataFile, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : parsed.channels || [];
}

function groupChannels(channels) {
  const groups = {
    news: [],
    sports: [],
    movies: [],
    kids: [],
    music: [],
    documentary: [],
    local: [],
    general: []
  };

  for (const channel of channels) {
    const category = (channel.category || 'general').toLowerCase();
    if (groups[category]) {
      groups[category].push(channel);
    } else {
      groups.general.push(channel);
    }
  }

  return groups;
}

function writePlaylists(channels) {
  ensureDir(outputDir);
  const groups = groupChannels(channels);

  const index = generateM3U(channels);
  fs.writeFileSync(path.join(outputDir, 'index.m3u'), index, 'utf8');

  const byCategory = [
    ['news', 'news.m3u'],
    ['sports', 'sports.m3u'],
    ['movies', 'movies.m3u'],
    ['kids', 'kids.m3u'],
    ['music', 'music.m3u'],
    ['documentary', 'documentary.m3u'],
    ['local', 'local.m3u'],
    ['general', 'general.m3u']
  ];

  for (const [key, filename] of byCategory) {
    const items = groups[key] || [];
    const content = generateM3U(items);
    fs.writeFileSync(path.join(outputDir, filename), content, 'utf8');
  }
}

try {
  const channels = loadChannels();
  writePlaylists(channels);
  console.log(`Built ${channels.length} channels into ${outputDir}`);
} catch (error) {
  console.error('Playlist build failed:', error.message);
  process.exit(1);
}

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'apps.json');
let cache = null;

async function loadApps(){
  if(cache) return cache;
  const raw = await fsp.readFile(dataPath, 'utf8');
  cache = JSON.parse(raw);
  return cache;
}

// invalidate cache when file changes (helpful during development)
try{
  fs.watchFile(dataPath, ()=>{ cache = null; });
}catch(e){ /* ignore watch errors */ }

module.exports = { loadApps };

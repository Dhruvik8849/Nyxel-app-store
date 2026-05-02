const fs = require('fs').promises;
const path = require('path');

async function rimraf(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main(){
  const repoRoot = path.resolve(__dirname, '..');
  const src = path.join(repoRoot, 'frontend');
  const out = path.join(repoRoot, 'public');
  console.log('Copying', src, '->', out);
  await rimraf(out);
  await copyDir(src, out);
  // Copy root media files (icons) into public/media so absolute /media/... paths work
  const mediaOut = path.join(out, 'media');
  await fs.mkdir(mediaOut, { recursive: true });
  const iconFiles = ['ic_launcher_foreground.webp', 'ic_launcher_background.webp'];
  for (const f of iconFiles) {
    const srcF = path.join(repoRoot, f);
    try {
      await fs.copyFile(srcF, path.join(mediaOut, f));
      console.log('Copied media', f);
    } catch (e) {
      // ignore missing icons
    }
  }
  console.log('Done. Files copied to', out);
}

main().catch(err=>{ console.error(err); process.exit(1); });

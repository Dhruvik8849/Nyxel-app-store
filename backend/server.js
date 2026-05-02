const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend statically
app.use(express.static(path.join(__dirname, '..', 'frontend')));
// Serve project root media files under /media (allows serving icons placed at repo root)
app.use('/media', express.static(path.join(__dirname, '..')));

// API routes
const appsRouter = require('./routes/apps');
app.use('/api', appsRouter);

// Download endpoint: supports /download?id=1 and /download/1
// Download endpoint: supports /download?id=1 and /download/1
const { loadApps } = require('./dataLoader');
app.get('/download/:id?', async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id) return res.status(400).send('Missing app id');

    const apps = await loadApps();
    const appMeta = apps.find(a => String(a.id) === String(id));
    if (!appMeta) return res.status(404).send('App not found');

    const apkName = appMeta.apk;
    if (!apkName) return res.status(404).send('APK not specified for this app');

    // Allow overriding the suggested filename presented to users when downloading.
    // Keep the stored filename unchanged (apkName) but set a friendly download name
    // for specific apps (the user requested a corrected Nyxel filename).
    let downloadName = apkName;
    try {
      if (String(appMeta.id) === 'nyxel-image' || apkName === 'APP_apk_file.apk') {
        downloadName = 'Nyxel_img_secure.apk';
      }
    } catch (e) {
      // ignore and fall back to apkName
    }

    const storageDir = path.join(__dirname, '..', 'storage', 'apk');
    const apkPath = path.resolve(storageDir, apkName);
    // Prevent path traversal: ensure resolved path starts with storageDir
    if (!apkPath.startsWith(path.resolve(storageDir))) return res.status(400).send('Invalid APK path');

    if (!fs.existsSync(apkPath)) return res.status(404).send('APK file missing on server');

    res.download(apkPath, downloadName, (err) => {
      if (err) {
        console.error('Download error', err);
        if (!res.headersSent) res.status(500).send('Error sending file');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Nyxel server running at http://localhost:${PORT}`);
});

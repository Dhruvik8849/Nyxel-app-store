const express = require('express');
const { loadApps } = require('../dataLoader');

const router = express.Router();

router.get('/apps', async (req, res) => {
  try {
    const apps = await loadApps();
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load apps' });
  }
});

module.exports = router;

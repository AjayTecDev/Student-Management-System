const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses ORDER BY name');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

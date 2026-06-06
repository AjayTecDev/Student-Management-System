const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'sms_super_secret_jwt_key_2024';

// Principal login
router.post('/principal/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM principal WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const principal = rows[0];
    // Support plain text passwords (for demo) and hashed
    const valid = password === principal.password || await bcrypt.compare(password, principal.password).catch(() => false);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: principal.id, role: 'principal', name: principal.name }, SECRET, { expiresIn: '8h' });
    res.json({ token, name: principal.name, role: 'principal' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student login
router.post('/student/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query(
      'SELECT s.*, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.username = ? AND s.status = "active"',
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const student = rows[0];
    const valid = password === student.password || await bcrypt.compare(password, student.password).catch(() => false);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: student.id, role: 'student', name: student.name }, SECRET, { expiresIn: '8h' });
    res.json({ token, name: student.name, role: 'student', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

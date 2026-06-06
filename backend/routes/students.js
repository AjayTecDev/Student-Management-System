const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, principalOnly } = require('../middleware/auth');

// Get all students
router.get('/', authMiddleware, principalOnly, async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT s.*, c.name as course_name 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.id
      ORDER BY s.enrolled_at DESC
    `);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add student
router.post('/', authMiddleware, principalOnly, async (req, res) => {
  try {
    const { name, email, phone, age, course_id, semester, username, password } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const [result] = await db.query(
      'INSERT INTO students (name, email, phone, age, course_id, semester, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, age, course_id, semester || 1, username || null, password || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Student added successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email or username already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', authMiddleware, principalOnly, async (req, res) => {
  try {
    const { name, email, phone, age, course_id, semester, username, password, status } = req.body;
    await db.query(
      'UPDATE students SET name=?, email=?, phone=?, age=?, course_id=?, semester=?, username=?, password=?, status=? WHERE id=?',
      [name, email, phone, age, course_id, semester, username, password, status || 'active', req.params.id]
    );
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', authMiddleware, principalOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set student login credentials
router.post('/:id/credentials', authMiddleware, principalOnly, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    await db.query('UPDATE students SET username=?, password=? WHERE id=?', [username, password, req.params.id]);
    res.json({ message: 'Credentials updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username already taken' });
    res.status(500).json({ error: err.message });
  }
});

// Student self-view
router.get('/self/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await db.query(
      'SELECT s.*, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

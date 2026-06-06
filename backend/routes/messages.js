const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, principalOnly } = require('../middleware/auth');

// Principal sends message
router.post('/', authMiddleware, principalOnly, async (req, res) => {
  try {
    const { subject, body, recipient_id } = req.body;
    if (!body) return res.status(400).json({ error: 'Message body required' });

    await db.query(
      'INSERT INTO messages (sender_type, sender_id, recipient_id, subject, body) VALUES ("principal", ?, ?, ?, ?)',
      [req.user.id, recipient_id || null, subject || 'Notice', body]
    );
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for student (broadcast + direct)
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, p.name as sender_name 
       FROM messages m 
       LEFT JOIN principal p ON m.sender_type = 'principal' AND m.sender_id = p.id
       WHERE m.recipient_id IS NULL OR m.recipient_id = ?
       ORDER BY m.sent_at DESC`,
      [req.user.id]
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages (principal view)
router.get('/', authMiddleware, principalOnly, async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT m.*, 
        CASE WHEN m.recipient_id IS NULL THEN 'All Students' ELSE s.name END as recipient_name
       FROM messages m
       LEFT JOIN students s ON m.recipient_id = s.id
       ORDER BY m.sent_at DESC`
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete message
router.delete('/:id', authMiddleware, principalOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

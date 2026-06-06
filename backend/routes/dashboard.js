const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, principalOnly } = require('../middleware/auth');

// Principal dashboard stats
router.get('/stats', authMiddleware, principalOnly, async (req, res) => {
  try {
    const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) as totalStudents FROM students WHERE status="active"');
    const [[{ totalCourses }]] = await db.query('SELECT COUNT(*) as totalCourses FROM courses');
    const [[{ addedThisYear }]] = await db.query(
      'SELECT COUNT(*) as addedThisYear FROM students WHERE YEAR(enrolled_at) = YEAR(CURDATE())'
    );

    // Students per course
    const [courseCounts] = await db.query(`
      SELECT c.name as course, COUNT(s.id) as count
      FROM courses c
      LEFT JOIN students s ON c.id = s.course_id AND s.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);

    // Recent students (last 5 added)
    const [recentStudents] = await db.query(`
      SELECT s.*, c.name as course_name 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.id
      ORDER BY s.enrolled_at DESC 
      LIMIT 5
    `);

    res.json({ totalStudents, totalCourses, addedThisYear, courseCounts, recentStudents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

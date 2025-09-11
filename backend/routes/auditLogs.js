const express = require('express');
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Audit logs route works' });
});

module.exports = router;  // ✅ make sure this is here


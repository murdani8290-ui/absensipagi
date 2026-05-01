import express from 'express';

const router = express.Router();

// Placeholder for admin routes
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

export default router;

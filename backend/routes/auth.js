import express from 'express';
import { supabase } from '../supabaseClient.js'; // Named import from your client setup
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ ensures user can log in immediately
      user_metadata: { name },
    });

    if (error) throw new Error(error.message);

    const token = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      id: data.user.id,
      name,
      email,
      token,
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(error.message);

    const token = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      id: data.user.id,
      email,
      token,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: err.message });
  }
});

export default router;
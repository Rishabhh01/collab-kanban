import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/test-supabase', async (req, res) => {
  const { data, error } = await supabase.from('boards').select('*').limit(1);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Supabase connected!', data });
});

export default router;

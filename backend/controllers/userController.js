import { supabase } from '../supabaseClient.js';
import { redis } from '../utils/redisClient.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Register or get user
export const getOrCreateUser = async (req, res) => {
  const { email, name } = req.body;

  // Check if user exists
  let { data, error } = await supabase.from('users').select('*').eq('email', email).single();

  if (error || !data) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, name }])
      .select();

    if (insertError) return res.status(400).json({ error: insertError.message });
    data = newUser[0];
  }

  // Generate JWT
  const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: data, token });
};

// Track online users using Redis
export const userOnline = async (req, res) => {
  const { board_id, user_id } = req.body;
  await redis.sadd(`board:${board_id}:users`, user_id);
  const onlineUsers = await redis.smembers(`board:${board_id}:users`);
  res.json({ onlineUsers });
};

export const userOffline = async (req, res) => {
  const { board_id, user_id } = req.body;
  await redis.srem(`board:${board_id}:users`, user_id);
  const onlineUsers = await redis.smembers(`board:${board_id}:users`);
  res.json({ onlineUsers });
};

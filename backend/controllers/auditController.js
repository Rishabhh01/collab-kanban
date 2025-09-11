import { supabase } from '../supabaseClient.js';

export const logAudit = async ({ board_id, user_id, event_type, details }) => {
  await supabase.from('audit_logs').insert([{ board_id, user_id, event_type, details }]);
};

import { supabase } from './supabase-config.js';

const FORBIDDEN_WORDS = ['hate', 'kill', 'abuse', 'slur', 'threat'];

export function containsProfanity(text) {
  const lower = text.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lower.includes(word));
}

export function checkRateLimit() {
  const lastSent = localStorage.getItem('last_msg_sent');
  if (lastSent) {
    const timePassed = (Date.now() - parseInt(lastSent, 10)) / 1000;
    if (timePassed < 30) return Math.ceil(30 - timePassed);
  }
  return 0;
}

export async function sendAnonymousMessage(recipientUsername, messageText) {
  const waitSeconds = checkRateLimit();
  if (waitSeconds > 0) throw new Error(`Please wait ${waitSeconds}s before sending another message.`);

  if (!messageText || messageText.trim().length === 0) throw new Error('Message cannot be empty.');
  if (messageText.length > 300) throw new Error('Message exceeds 300 characters.');
  if (containsProfanity(messageText)) throw new Error('Inappropriate language detected.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, allow_messages')
    .eq('username', recipientUsername.toLowerCase())
    .single();

  if (profileError || !profile) throw new Error('Recipient user does not exist.');
  if (!profile.allow_messages) throw new Error('User is currently not accepting messages.');

  const { error: insertError } = await supabase
    .from('messages')
    .insert([{ recipient_id: profile.id, content: messageText.trim() }]);

  if (insertError) throw insertError;
  localStorage.setItem('last_msg_sent', Date.now().toString());
  return true;
}

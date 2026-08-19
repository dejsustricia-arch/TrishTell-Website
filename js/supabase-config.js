import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SUPABASE_URL = 'https://dedabvjdssvxjzyzwzhw.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_K46VaHD9eUta0canvO7CGg_hU2Kye7d';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

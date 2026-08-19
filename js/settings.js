import { supabase } from './supabase-config.js';
import { requireAuth } from './auth.js';

export async function initSettings() {
  const profile = await requireAuth();

  const nameInput = document.getElementById('display-name-input');
  const bioInput = document.getElementById('bio-input');
  const allowToggle = document.getElementById('allow-messages-toggle');
  const statusAlert = document.getElementById('status-alert');

  nameInput.value = profile.display_name || '';
  bioInput.value = profile.bio || '';
  allowToggle.checked = profile.allow_messages;

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    statusAlert.style.display = 'none';

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: nameInput.value.trim(),
        bio: bioInput.value.trim(),
        allow_messages: allowToggle.checked
      })
      .eq('id', profile.id);

    if (error) {
      statusAlert.className = 'alert alert-error';
      statusAlert.innerText = error.message;
    } else {
      statusAlert.className = 'alert alert-success';
      statusAlert.innerText = 'Profile updated successfully! ♡';
    }
  });
}

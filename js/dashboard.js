import { supabase } from './supabase-config.js';
import { requireAuth, logoutUser } from './auth.js';

let currentProfile = null;

export async function initDashboard() {
  currentProfile = await requireAuth();
  
  document.getElementById('user-display-name').innerText = currentProfile.display_name;
  document.getElementById('user-handle').innerText = `@${currentProfile.username}`;
  
  const personalLink = `${window.location.origin}/u.html?u=${currentProfile.username}`;
  document.getElementById('personal-link-input').value = personalLink;

  document.getElementById('logout-btn').addEventListener('click', logoutUser);
  document.getElementById('copy-link-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(personalLink);
    alert('Link copied to clipboard! ♡');
  });

  document.getElementById('share-btn').addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'Send me anonymous messages!', url: personalLink });
    } else {
      navigator.clipboard.writeText(personalLink);
      alert('Link copied to clipboard!');
    }
  });

  loadInbox();
}

export async function loadInbox() {
  const container = document.getElementById('inbox-container');
  container.innerHTML = '<p class="text-center">Loading messages...</p>';

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', currentProfile.id)
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = '<p class="text-center">Failed to load messages.</p>';
    return;
  }

  if (messages.length === 0) {
    container.innerHTML = `<div class="text-center" style="padding: 30px 0;"><p style="font-size: 1.2rem;">💌</p><p>No messages yet!</p></div>`;
    return;
  }

  container.innerHTML = '';
  messages.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'message-card';
    const dateStr = new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div class="message-meta"><span>Anonymous</span><span>${dateStr}</span></div>
      <div class="message-content">${escapeHTML(msg.content)}</div>
      <div class="message-actions">
        <button class="btn btn-secondary btn-sm report-btn">Report</button>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </div>
    `;

    card.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm('Delete message?')) {
        await supabase.from('messages').delete().eq('id', msg.id);
        loadInbox();
      }
    });

    card.querySelector('.report-btn').addEventListener('click', async () => {
      const reason = prompt('Reason for reporting:');
      if (reason) {
        await supabase.from('reports').insert([{ message_id: msg.id, reporter_id: currentProfile.id, reason }]);
        alert('Reported successfully.');
      }
    });

    container.appendChild(card);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
                            }

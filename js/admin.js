import { supabase } from './supabase-config.js';
import { requireAuth } from './auth.js';

export async function initAdmin() {
  const profile = await requireAuth();

  if (!profile.is_admin) {
    alert('Access denied. Admin rights required.');
    window.location.href = 'dashboard.html';
    return;
  }

  loadReports();
}

async function loadReports() {
  const container = document.getElementById('reports-container');
  container.innerHTML = '<p class="text-center">Loading reports...</p>';

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*, messages(content)')
    .order('created_at', { ascending: false });

  if (error || !reports) {
    container.innerHTML = '<p class="text-center">Error loading reports.</p>';
    return;
  }

  container.innerHTML = '';
  reports.forEach(report => {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
      <div class="message-meta"><span>Report ID: ${report.id.substring(0, 8)}</span><span>Status: ${report.status}</span></div>
      <p><strong>Reason:</strong> ${report.reason}</p>
      <div class="message-content">${report.messages ? report.messages.content : '<em>[Deleted]</em>'}</div>
      <div class="message-actions">
        <button class="btn btn-danger btn-sm purge-btn">Delete Message</button>
        <button class="btn btn-secondary btn-sm dismiss-btn">Dismiss</button>
      </div>
    `;

    card.querySelector('.purge-btn').addEventListener('click', async () => {
      if (report.message_id) await supabase.from('messages').delete().eq('id', report.message_id);
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', report.id);
      loadReports();
    });

    card.querySelector('.dismiss-btn').addEventListener('click', async () => {
      await supabase.from('reports').update({ status: 'dismissed' }).eq('id', report.id);
      loadReports();
    });

    container.appendChild(card);
  });
}

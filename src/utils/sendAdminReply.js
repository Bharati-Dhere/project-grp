// Utility to call backend email API
export async function sendAdminReply({ to, subject, text, html }) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, text, html })
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
}

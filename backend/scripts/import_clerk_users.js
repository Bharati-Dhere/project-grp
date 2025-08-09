// Usage: node import_clerk_users.js users.json

const fs = require('fs');
const fetch = require('node-fetch'); // npm install node-fetch@2
const path = process.argv[2];

if (!path) {
  console.error('Usage: node import_clerk_users.js <users.json>');
  process.exit(1);
}

const users = JSON.parse(fs.readFileSync(path, 'utf-8'));

async function importUser(user) {
  // Find the first valid email in email_addresses array
  let email;
  if (Array.isArray(user.email_addresses)) {
    for (const e of user.email_addresses) {
      if (e.email_address) {
        email = e.email_address;
        break;
      }
    }
  }
  const payload = {
    email,
    name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    role: 'user',
    clerkId: user.id,
  };
  if (!email) {
    console.error('Skipped user with missing email:', user.id);
    return;
  }
  console.log('Sending payload:', payload);
  const res = await fetch('http://localhost:5000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('Backend response:', data);
  console.log('Imported:', data.email);
}

(async () => {
  for (const user of users) {
    await importUser(user);
  }
  console.log('All users imported!');
})();

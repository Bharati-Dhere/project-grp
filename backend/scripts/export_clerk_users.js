// Usage: node export_clerk_users.js
// You need your Clerk API key: https://dashboard.clerk.com/settings/api-keys

const fetch = require('node-fetch'); // npm install node-fetch@2
const fs = require('fs');

const CLERK_API_KEY = 'sk_test_8hhgxm1qdcDCR9Xkcd8oK0thL4sk1WMS3GnhOOEyb4'; // <-- Replace with your Clerk API key

async function fetchAllUsers() {
  const res = await fetch('https://api.clerk.com/v1/users', {
    headers: {
      'Authorization': `Bearer ${CLERK_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    console.error('Failed to fetch users:', res.status, await res.text());
    process.exit(1);
  }
  const users = await res.json();
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log('Exported', users.length, 'users to users.json');
}

fetchAllUsers();

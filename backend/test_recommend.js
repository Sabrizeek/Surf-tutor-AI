const fetch = require('node-fetch');

async function test() {
  const url = process.env.BACKEND_URL || 'http://localhost:3000/api/recommend';
  const payload = {
    skillLevel: 'beginner',
    goal: 'cardio',
    userDetails: {
      bmi: 23.4,
      age: 29,
      weight: 75,
      height: 178
    }
  };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await resp.json();
    console.log('status', resp.status);
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Request failed', e.message || e);
  }
}

test();

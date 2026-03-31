// server.js — JugaadX → Meta CAPI bridge
const express = require('express');
const crypto  = require('crypto');
const app     = express();
app.use(express.json());

const DATASET_ID   = '1567291387695476';
const ACCESS_TOKEN = 'EAARwCZB86Dw4BRDrFUG99AbS4SUBTW9FQ3VPMZA9DxV9XdLuN1UBiJzY04kh3DIkLxnzMWAw8nIXvdostrcb0GujDvcLxDCpvbWWuZC6OhlXsx4NoyDT3Cl4UZCl4UAsZA8dLZASl8em2FBKHZA75Xjejh09WBG6uEz2SOBnMRrSdifU7fuRnVC8DguqKFetZBSJSAZDZD'; // paste your full token here;

function hash(val) {
  return crypto
    .createHash('sha256')
    .update(val.trim().toLowerCase())
    .digest('hex');
}

// Health check for UptimeRobot
app.get('/', (req, res) => res.send('OK'));

app.post('/capi-lead', async (req, res) => {
  const contact = req.body;
  console.log('JugaadX payload:', JSON.stringify(contact, null, 2));

  const phone = contact.from;
  const clid  = contact.ctwa_clid || null;
  const now   = Math.floor(Date.now() / 1000);

  const payload = {
    data: [{
      event_name: 'LeadSubmitted',
      event_time: now,
      event_id: crypto.randomUUID(),
      action_source: 'business_messaging',
      messaging_channel: 'whatsapp',
      user_data: {
        ph: phone ? [hash(phone)] : [],
        ...(clid && { ctwa_clid: clid }),
      }
    }]
  };

  const url = `https://graph.facebook.com/v19.0/${DATASET_ID}/events?access_token=${ACCESS_TOKEN}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log('Meta response:', result);
  res.json({ ok: true, result });
});

app.listen(3000, () => console.log('CAPI bridge running on port 3000'));

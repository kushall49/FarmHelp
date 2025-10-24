const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log('[REQUEST] GET /');
  res.json({ ok: true });
});

app.post('/api/chatbot', (req, res) => {
  console.log('[REQUEST] POST /api/chatbot');
  const { message } = req.body;
  res.json({ reply: `Mock reply for: ${message}` });
});

const server = app.listen(4000, () => {
  console.log('[SERVER] Running on http://localhost:4000');
  console.log('[SERVER] Process ID:', process.pid);
});

server.on('error', (err) => {
  console.error('[SERVER ERROR]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('exit', (code) => {
  console.log('[PROCESS EXIT]', code);
});

setInterval(() => {
  console.log('[HEARTBEAT] Server still running...');
}, 5000);

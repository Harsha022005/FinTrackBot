import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import handler from './Telegrambot/handler.js';
dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/webhook', async (req, res) => {
  console.log(req.body);
  await handler(req);
  res.send('OK');
});

// Home routes
app.get('/', async (req, res) => {
  // res.send('Hello');
    console.log(req.body);
  res.send(await handler(req));
});
app.post('/', async (req, res) => {
  console.log(req.body);
  // res.send('Hello POST');
  res.send(await handler(req))
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

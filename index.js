import express from 'express';
import connectDB from './models/db.js';
import dotenv from 'dotenv';
import { handletelegramupdates } from './Routes/Telegramhandler.js';
import { setWebhook } from './Routes/Telegramhandler.js';

setWebhook();

dotenv.config();

const port = 5000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    console.log('Request received', req.body);
    res.send('Get request received');
});


app.post('/bot', async (req, res) => {
    const msg = req.body.message;
    if (msg) {
        await handletelegramupdates(msg);
    }
    res.sendStatus(200);
});

const startServer = async () => {
    await connectDB(); 
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};

startServer();

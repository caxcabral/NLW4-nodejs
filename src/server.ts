import 'reflect-metadata';
import express from 'express';
import router from './routes';
const PORT = 3001

const app = express();
app.get('/', (req, res) => {res.send('Rodando')});

app.listen(PORT, () => console.log('Rodando na porta ' + PORT));
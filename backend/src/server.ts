import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { connectDB } from './config/database';
import apiRouter from './routes';
import { handlers } from './errors';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());

// Routes
app.use('/api/', apiRouter);

// Error handling middleware
app.use(handlers);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server in esecuzione su porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Errore avvio server:', error);
    process.exit(1);
  }
};

startServer();
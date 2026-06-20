import express from 'express';
import { connectMongoDB } from './config/db';
import { env } from './config/env';
import router from './routes/routes'

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Hello World route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Auth routes
app.use('/auth', router);

// In your main file where connectMongoDB is called:
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(3000, () => {
      console.log(`Server running in ${env.NODEENV} mode on port 3000`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

import express from 'express';
import { connectMongoDB } from './config/db';
import { env } from './config/env';
import router from './routes/routes'
const app = express();
app.use('/auth', router)
// In your main file where connectMongoDB is called:
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(env.PORT, () => {
      console.log(`Server running in ${env.NODEENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
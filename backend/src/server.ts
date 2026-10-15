import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(` FORMALS FOR US API Server Running`);
      console.log(` Port: ${ENV.PORT}`);
      console.log(` Environment: ${ENV.NODE_ENV}`);
      console.log(` Health check: http://localhost:${ENV.PORT}/health`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Received kill signal, shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Closed out remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer();

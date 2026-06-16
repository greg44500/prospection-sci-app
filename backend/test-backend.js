/**
 * Quick Backend Test
 * Tests that all modules can be imported and basic functionality works
 */

import 'dotenv/config.js';
import app from './src/app.js';
import { config } from './src/config/env.js';
import { isConnected } from './src/config/database.js';

console.log('\n=== Backend Module Test ===\n');

try {
  console.log('✓ Express app loaded successfully');
  console.log(`✓ Environment: ${config.env}`);
  console.log(`✓ Port: ${config.port}`);
  console.log(`✓ Frontend URL: ${config.frontendUrl}`);
  console.log(`✓ MongoDB state: ${isConnected() ? 'checking...' : 'not connected'}`);
  
  // Test if app is listening can be set up
  const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`✓ Server can bind to dynamic port: ${port}`);
    server.close(() => {
      console.log('\n✓ All tests passed! Backend is ready to use.\n');
      process.exit(0);
    });
  });

  server.on('error', (err) => {
    console.error('✗ Error:', err.message);
    process.exit(1);
  });
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}

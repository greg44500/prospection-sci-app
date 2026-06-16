/**
 * MongoDB Connection Configuration
 */

import mongoose from 'mongoose';
import { config } from './env.js';

let connectionState = 'disconnected'; // 'connecting', 'connected', 'disconnected', 'error'

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  if (connectionState === 'connected') {
    console.log('Already connected to MongoDB');
    return;
  }

  if (connectionState === 'connecting') {
    console.log('Already connecting to MongoDB');
    return;
  }

  if (!config.mongodb.uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    connectionState = 'connecting';
    console.log('Connecting to MongoDB...');

    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connectionState = 'connected';
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    connectionState = 'error';
    console.error('✗ MongoDB connection error:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  if (connectionState === 'disconnected') {
    return;
  }

  try {
    await mongoose.disconnect();
    connectionState = 'disconnected';
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error.message);
    throw error;
  }
};

/**
 * Get current connection state
 * @returns {string}
 */
export const getConnectionState = () => {
  return connectionState;
};

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
export const isConnected = () => {
  return connectionState === 'connected' && mongoose.connection.readyState === 1;
};

export default {
  connectDB,
  disconnectDB,
  getConnectionState,
  isConnected,
};

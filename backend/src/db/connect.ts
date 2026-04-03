import mongoose from 'mongoose';
import { env } from '../config/env';

interface ConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
}

class DatabaseConnection {
  private retryCount = 0;
  private isConnecting = false;
  private connectionPromise: Promise<mongoose.Connection> | null = null;

  async connect(options: ConnectionOptions = {}): Promise<mongoose.Connection> {
    const { maxRetries = 5, retryDelay = 1000, maxRetryDelay = 30000 } = options;

    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.attemptConnection(maxRetries, retryDelay, maxRetryDelay);
    return this.connectionPromise;
  }

  private async attemptConnection(
    maxRetries: number,
    retryDelay: number,
    maxRetryDelay: number
  ): Promise<mongoose.Connection> {
    while (this.retryCount <= maxRetries) {
      try {
        mongoose.set('strictQuery', true);
        
        // Configure connection options for production resilience
        const connectionOptions = {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferMaxEntries: 0,
          bufferCommands: false,
        };

        await mongoose.connect(env.MONGODB_URI, connectionOptions);
        
        // Reset retry count on successful connection
        this.retryCount = 0;
        this.isConnecting = false;
        
        // Set up connection event handlers
        this.setupConnectionHandlers();
        
        console.log('Database connected successfully');
        return mongoose.connection;
      } catch (error) {
        this.retryCount++;
        console.error(`Database connection attempt ${this.retryCount} failed:`, error);

        if (this.retryCount > maxRetries) {
          this.connectionPromise = null;
          throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error}`);
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          retryDelay * Math.pow(2, this.retryCount - 1) + Math.random() * 1000,
          maxRetryDelay
        );
        
        console.log(`Retrying database connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unexpected error in database connection logic');
  }

  private setupConnectionHandlers(): void {
    mongoose.connection.on('error', (error) => {
      console.error('Database connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Database disconnected. Attempting to reconnect...');
      this.connectionPromise = null;
      this.retryCount = 0;
      // Attempt to reconnect
      this.connect().catch(error => {
        console.error('Failed to reconnect to database:', error);
      });
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Database reconnected successfully');
    });
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.connectionPromise = null;
      this.retryCount = 0;
      console.log('Database disconnected gracefully');
    } catch (error) {
      console.error('Error during database disconnection:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
const dbConnection = new DatabaseConnection();

export async function connectDb(options?: ConnectionOptions): Promise<mongoose.Connection> {
  return dbConnection.connect(options);
}

export async function disconnectDb(): Promise<void> {
  return dbConnection.disconnect();
}

export function isDbConnected(): boolean {
  return dbConnection.isConnected();
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connection...');
  try {
    await disconnectDb();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connection...');
  try {
    await disconnectDb();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

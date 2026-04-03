"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = connectDb;
exports.disconnectDb = disconnectDb;
exports.isDbConnected = isDbConnected;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
class DatabaseConnection {
    retryCount = 0;
    isConnecting = false;
    connectionPromise = null;
    async connect(options = {}) {
        const { maxRetries = 5, retryDelay = 1000, maxRetryDelay = 30000 } = options;
        // Return existing connection promise if already connecting
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.connectionPromise = this.attemptConnection(maxRetries, retryDelay, maxRetryDelay);
        return this.connectionPromise;
    }
    async attemptConnection(maxRetries, retryDelay, maxRetryDelay) {
        while (this.retryCount <= maxRetries) {
            try {
                mongoose_1.default.set('strictQuery', true);
                // Configure connection options for production resilience
                const connectionOptions = {
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    bufferMaxEntries: 0,
                    bufferCommands: false,
                };
                await mongoose_1.default.connect(env_1.env.MONGODB_URI, connectionOptions);
                // Reset retry count on successful connection
                this.retryCount = 0;
                this.isConnecting = false;
                // Set up connection event handlers
                this.setupConnectionHandlers();
                console.log('Database connected successfully');
                return mongoose_1.default.connection;
            }
            catch (error) {
                this.retryCount++;
                console.error(`Database connection attempt ${this.retryCount} failed:`, error);
                if (this.retryCount > maxRetries) {
                    this.connectionPromise = null;
                    throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error}`);
                }
                // Exponential backoff with jitter
                const delay = Math.min(retryDelay * Math.pow(2, this.retryCount - 1) + Math.random() * 1000, maxRetryDelay);
                console.log(`Retrying database connection in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Unexpected error in database connection logic');
    }
    setupConnectionHandlers() {
        mongoose_1.default.connection.on('error', (error) => {
            console.error('Database connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('Database disconnected. Attempting to reconnect...');
            this.connectionPromise = null;
            this.retryCount = 0;
            // Attempt to reconnect
            this.connect().catch(error => {
                console.error('Failed to reconnect to database:', error);
            });
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('Database reconnected successfully');
        });
    }
    async disconnect() {
        try {
            await mongoose_1.default.disconnect();
            this.connectionPromise = null;
            this.retryCount = 0;
            console.log('Database disconnected gracefully');
        }
        catch (error) {
            console.error('Error during database disconnection:', error);
            throw error;
        }
    }
    isConnected() {
        return mongoose_1.default.connection.readyState === 1;
    }
}
// Export singleton instance
const dbConnection = new DatabaseConnection();
async function connectDb(options) {
    return dbConnection.connect(options);
}
async function disconnectDb() {
    return dbConnection.disconnect();
}
function isDbConnected() {
    return dbConnection.isConnected();
}
// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing database connection...');
    try {
        await disconnectDb();
        process.exit(0);
    }
    catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
});
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing database connection...');
    try {
        await disconnectDb();
        process.exit(0);
    }
    catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
});

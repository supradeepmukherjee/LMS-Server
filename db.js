import mongoose from "mongoose"

const MAX_RETRIES = 4
const RETRY_INTERVAL = 5000

class DBConnection {
    constructor() {
        this.retryCount = 0
        this.isConnected = false
        mongoose.set('strictQuery', true)
        mongoose.connection.on('connected', () => {
            console.log('DB connected')
            this.isConnected = true
        })
        mongoose.connection.on('error', () => {
            console.log('DB connection error')
            this.isConnected = false
        })
        mongoose.connection.on('disconnected', () => {
            console.log('DB disconnected')
            this.handleDisconnection()
        })
        process.on('SIGTERM', this.handleAppTermination.bind(this))//
    }
    async connect() {
        try {
            if (!process.env.MONGO_URI) throw new Error("MONGO_URI not defined in env variables");
            if (process.env.NODE_ENV === 'development') mongoose.set('debug', true)
            await mongoose.connect(process.env.MONGO_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 44000,
                family: 4
            })
            this.retryCount = 0
        } catch (err) {
            console.error(err.message);
            await this.handleConnectionError()
        }
    }
    async handleConnectionError() {
        if (this.retryCount < MAX_RETRIES) {
            this.retryCount++
            console.log(`Retrying to connect to DB (${this.retryCount}/${MAX_RETRIES})`)
            await new Promise(res => setTimeout(() => {
                res()
            }, RETRY_INTERVAL))
            return this.connect()
        } else {
            console.error(`Failed to connect to DB after retrying ${MAX_RETRIES} times`)
            process.exit(1)
        }
    }
    async handleDisconnection() {
        if (!this.isConnected) {
            console.log('Trying to reconnect to DB')
            this.connect()
        }
    }
    async handleAppTermination() {
        try {
            await mongoose.connection.close()
            console.log('DB connection closed through app termination')
            process.exit(0)
        } catch (err) {
            console.error('Error during DB Disconnection', err)
            process.exit(1)
        }
    }
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        }
    }
}

const dbConnection = new DBConnection()

export const getDbStatus = dbConnection.getConnectionStatus.bind(dbConnection)//
export default dbConnection.connect.bind(dbConnection)//
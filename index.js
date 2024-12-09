import { config } from "dotenv";
import morgan from "morgan";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import expressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from 'cors'

config()

const port = process.env.PORT
const nodeEnv = process.env.NODE_ENV

const app = express()

const limit = rateLimit({
    windowMs: 15 * 60000,
    limit: 100,
    message: 'Too many requests, please try again later'
})

app.use(helmet())
app.use(expressMongoSanitize())
app.use(hpp())
app.use(cookieParser())
app.use('/api', limit)

if (nodeEnv === 'development') app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))

app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({
        status: 'error',
        msg: err.message || 'Something Unexpected Happened',
        ...(nodeEnv === 'development' && { stack: err.stack })
    })
})

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
}))

app.use((req, res) => res.status(404).json({
    status: 'error',
    msg: 'Route not found'
}))

app.listen(port, () => console.log(`Server is walking on port ${port} in ${nodeEnv} mode`))
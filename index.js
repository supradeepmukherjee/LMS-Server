import { config } from "dotenv";
import morgan from "morgan";
import express from "express";

config()

const port = process.env.PORT
const nodeEnv = process.env.NODE_ENV

const app = express()

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

app.use((req, res) => res.status(404).json({
    status: 'error',
    msg: 'Route not found'
}))

app.listen(port, () => console.log(`Server is walking on port ${port} in ${nodeEnv} mode`))
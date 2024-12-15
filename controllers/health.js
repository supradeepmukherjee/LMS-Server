import { getDbStatus } from "../db.js"

const getReadyStateText = state => { // utility method
    switch (state) {
        case 0: return 'Disconnected'
        case 1: return 'Connected'
        case 2: return 'Connecting'
        case 3: return 'Disconnecting'
        default: return 'Unknown'
    }
}

const checkHealth = async (req, res) => {
    try {
        const dbStatus = getDbStatus()
        const healthStatus = {
            status: 'OK',
            timestamp: new Date().toString(),
            services: {
                db: {
                    status: dbStatus.isConnected ? 'Healthy' : 'Unhealthy',
                    details: {
                        ...dbStatus,
                        readyState: getReadyStateText(dbStatus.readyState)
                    }
                },
                server: {
                    status: 'Healthy',
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage()
                }
            }
        }
        res
            .status(healthStatus.services.db.status === 'Healthy' ? 200 : 503)
            .json(healthStatus)
    } catch (err) {
        console.log('Health Check failed', err)
        res.status(500).json({
            timestamp: new Date().toString(),
            err: err.message
        })
    }
}

export default checkHealth
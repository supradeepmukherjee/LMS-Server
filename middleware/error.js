export const catchAsync = f => {
    return (req, res, next) => {
        f(req, res, next).catch(next)
    }
}

export class ApiError extends Error {
    constructor(msg, status) {
        super(msg)
        this.statusCode = status
        this.status = String(status).startsWith('4') ? 'Failure' : 'Error'
        Error.captureStackTrace(this, this.constructor)
    }
}

export const handleJWTError = () => new ApiError('Invalid Token. Please login again', 401)
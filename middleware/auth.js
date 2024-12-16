import jwt from "jsonwebtoken";
import { ApiError, catchAsync, handleJWTError } from "./error";

const isAuthenticated = catchAsync(async (req, res, next) => {
    const token = req.cookies.token
    if (!token) handleJWTError()
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.id = decoded.userId
        next()
    } catch (err) {
        throw new ApiError('JWT Token Error', 401)
    }
})

export default isAuthenticated
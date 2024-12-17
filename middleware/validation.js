import { body, query, validationResult } from "express-validator"

const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(v.run(req)))
        const errors = validationResult(req)
        if (errors.isEmpty()) return next()
        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            msg: err.msg
        }))
        throw new Error('Validation Error' + extractedErrors)
    }
}

const commonValidations = {
    pagination: [
        query('pg').optional().isInt({ min: 1 }).withMessage('Page must be a +ve integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be from 0-100'),
    ],
    email: body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    name: body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Please provide a valid Name')
}

export const validateSignUp = validate([commonValidations.email, commonValidations.name])

export default validate
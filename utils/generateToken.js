import jwt from "jsonwebtoken";

const generate = (res, user, msg) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    return res
        .status(200)
        .cookie(
            'token',
            token,
            {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60000
            }
        )
        .json({ success: true })
}

export default generate
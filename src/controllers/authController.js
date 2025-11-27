const prisma = require('../helper/prisma');
const { hashValue, compareValue } = require('../helper/hash');
const { generateToken, generateRefreshToken } = require('../helper/jwt');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validations/authValidation');
const jwt = require('jsonwebtoken');
const { TokenType } = require('@prisma/client')

const register = async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }

        const { full_name, user_name, email, phone_number, basic_salary, password } = parsed.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { user_name }
                ]
            }
        })
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? 'Email sudah terdaftar'
                    : 'Username sudah digunakan'
            });
        }
        const hashed = await hashValue(password);
        const newUser = await prisma.user.create({
            data: {
                full_name,
                user_name,
                email,
                phone_number,
                basic_salary,
                password: hashed
            }
        })
        res.status(201).json({
            message: 'User berhasil didaftarkan',
            data: {
                id: newUser.id,
                email: newUser.email,

            }
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })

    }
}
const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return res.status(400).json({
                message: 'Email atau password salah'
            })
        }

        const isPasswordValid = await compareValue(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Email atau password salah'
            })
        }
        await prisma.tokenAuth.deleteMany({
            where: {
                user_id: user.id,
                token_type: TokenType.REFRESH
            }
        });
        const accessToken = generateToken({ id: user.id });
        const refreshToken = generateRefreshToken({ id: user.id });

        await prisma.tokenAuth.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                token_type: TokenType.REFRESH,
                expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
        })
        console.log("REFRESH TOKEN DISIMPAN:", refreshToken);

        res.status(200).json({
            message: 'Login berhasil',
            data: {
                id: user.id,
                email: user.email,
            },
            access_token: accessToken,
            refresh_token: refreshToken
        })
    } catch (error) {
        console.log("ERROR SIMPAN TOKEN:", error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })

    }
}

const refreshToken = async (req, res) => {

    try {
        const parsed = refreshTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }
        const { refresh_token } = parsed.data;

        const dbToken = await prisma.tokenAuth.findFirst({
            where: {
                token: refresh_token,
                token_type: TokenType.REFRESH,
                expired_at: { gt: new Date() }
            },
            include: {
                user: true
            }
        });
        if (!dbToken) {
            return res.status(401).json({
                message: 'Refresh token not found or expired'
            });
        }
        try {
            jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            return res.status(401).json({
                message: 'Invalid refresh token'
            });
        }

        const newAccessToken = generateToken({ id: dbToken.user.id });

        return res.status(200).json({
            message: 'Token refreshed successfully',
            access_token: newAccessToken,
            refresh_token: refresh_token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });

    }
}

const me = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                full_name: true,
                user_name: true,
                email: true,
                phone_number: true,
                basic_salary: true
            }
        })
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        res.status(200).json({
            message: 'User profile retrieved successfully',
            data: user
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}
module.exports = {
    register,
    login,
    refreshToken,
    me
}
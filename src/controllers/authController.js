const prisma = require('../helper/prisma');
const { hashValue, compareValue } = require('../helper/hash');
const { generateToken, generateRefreshToken } = require('../helper/jwt');
const { registerSchema,
    loginSchema,
    refreshTokenSchema,
    requestEmailChangeSchema,
    verifyEmailChangeSchema,
    updateProfileSchema } = require('../validations/authValidation');
const jwt = require('jsonwebtoken');
const { generateOtpCode } = require('../helper/otp');
const { TokenType } = require('@prisma/client')
const { sendOtpChangeEmailMail } = require('../helper/mail');
const { parse } = require('dotenv');
const e = require('express');

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

const changeEmail = async (req, res) => {
    try {
        const parsed = requestEmailChangeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }
        const { current_password, new_email } = parsed.data;
        const userId = req.user.id;

        if (new_email === req.user.email) {
            return res.status(400).json({
                message: 'Email baru tidak boleh sama dengan email saat ini'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User tidak ditemukan'
            });
        }
        const isPasswordValid = await compareValue(current_password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Password saat ini salah'
            });
        }
        const emailUsed = await prisma.user.findUnique({
            where: { email: new_email }
        });
        if (emailUsed) {
            return res.status(400).json({
                message: 'Email sudah digunakan oleh user lain'
            });
        }

        const otp = generateOtpCode()
        const hashedOtp = await hashValue(otp);
        const expired = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        await prisma.tokenAuth.create({
            data: {
                user_id: user.id,
                token: hashedOtp,
                token_type: TokenType.OTP_CHANGE_EMAIL,
                expired_at: expired
            }
        })
        await sendOtpChangeEmailMail(new_email, otp);

        return res.status(200).json({
            message: 'OTP untuk verifikasi perubahan email telah dikirim ke email baru'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const verifyEmailChange = async (req, res) => {
    try {
        const parsed = verifyEmailChangeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }
        const { new_email, otp } = parsed.data;
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User tidak ditemukan'
            });
        }
        const otpRecord = await prisma.tokenAuth.findFirst({
            where: {
                user_id: user.id,
                token_type: TokenType.OTP_CHANGE_EMAIL,
                expired_at: { gt: new Date() }
            },
            orderBy: { created_at: 'desc' }
        });
        if (!otpRecord) {
            return res.status(400).json({
                message: 'OTP tidak ditemukan atau sudah kadaluarsa'
            });
        }
        const isOtpValid = await compareValue(otp, otpRecord.token);
        if (!isOtpValid) {
            return res.status(400).json({
                message: 'OTP tidak valid'
            });
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { email: new_email }
        });
        await prisma.tokenAuth.deleteMany({
            where: {
                user_id: user.id,
                token_type: TokenType.OTP_CHANGE_EMAIL
            }
        });
        return res.status(200).json({
            message: 'Email berhasil diubah'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
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

const updateProfile = async (req, res) => {
    try {
        parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }
        const data = parsed.data;
        const userId = req.user.id;
        const existingUser = await prisma.user.findFirst({
            where: {
                user_name: data.user_name
            }
        });
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({
                message: 'Username sudah digunakan oleh user lain'
            });
        }

        const upadatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                full_name: data.full_name,
                user_name: data.user_name,
                phone_number: data.phone_number,
                basic_salary: data.basic_salary
            }
        });
        return res.status(200).json({
            message: 'Profile updated successfully',
            data: upadatedUser
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}
module.exports = {
    register,
    login,
    refreshToken,
    changeEmail,
    verifyEmailChange,
    me,
    updateProfile
}
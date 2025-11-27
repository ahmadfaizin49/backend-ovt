const prisma = require('../helper/prisma')
const { forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema, changePasswordSchema } = require('../validations/passwordValidation')
const { generateOtpCode } = require('../helper/otp')
const { hashValue, compareValue } = require('../helper/hash')
const { TokenType } = require('@prisma/client')
const { sendOtpResetPasswordMail } = require('../helper/mail')

const forgotPassword = async (req, res) => {
    try {
        parsed = forgotPasswordSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                status: 'error',
                message: parsed.error.issues.map((e) => e.message)
            })
        }
        const { email } = parsed.data

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan'
            })
        }
        const otpCode = generateOtpCode()
        const hashedOtp = await hashValue(otpCode)
        await prisma.tokenAuth.create({
            data: {
                user_id: user.id,
                token: hashedOtp,
                token_type: TokenType.OTP_RESET,
                expired_at: new Date(Date.now() + 10 * 60 * 1000) // 10 menit


            }
        })

        await sendOtpResetPasswordMail(email, otpCode)
        return res.status(200).json({
            message: 'OTP reset password telah dikirim ke email'
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })

    }

}
const verifyOtp = async (req, res) => {
    try {
        parsed = verifyOtpSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                status: 'error',
                message: parsed.error.issues.map((e) => e.message)
            })
        }
        const { email, otp } = parsed.data
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan'
            })
        }
        const tokenOtp = await prisma.tokenAuth.findFirst({
            where: {
                user_id: user.id,
                token_type: TokenType.OTP_RESET,
                expired_at: { gte: new Date() }
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        if (!tokenOtp) {
            return res.status(400).json({
                message: 'OTP tidak ditemukan, silakan minta OTP baru'
            })
        }
        const isOtpValid = await compareValue(otp, tokenOtp.token)
        if (!isOtpValid) {
            return res.status(400).json({
                message: 'OTP tidak valid'
            })
        }
        return res.status(200).json({
            message: 'OTP valid'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        parsed = resetPasswordSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                status: 'error',
                message: parsed.error.issues.map((e) => e.message)
            })
        }
        const { email, otp, new_password } = parsed.data
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan'
            })
        }
        const tokenOtp = await prisma.tokenAuth.findFirst({
            where: {
                user_id: user.id,
                token_type: TokenType.OTP_RESET,
                expired_at: { gte: new Date() }
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        if (!tokenOtp) {
            return res.status(400).json({
                message: 'OTP tidak ditemukan, silakan minta OTP baru'
            })
        }
        const isOtpValid = await compareValue(otp, tokenOtp.token)
        if (!isOtpValid) {
            return res.status(400).json({
                message: 'OTP tidak valid'
            })
        }
        const hashedPassword = await hashValue(new_password)
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            }
        })
        await prisma.tokenAuth.deleteMany({
            where: {
                user_id: user.id,
                token_type: TokenType.OTP_RESET
            }
        })
        return res.status(200).json({
            message: 'Password berhasil direset'
        })


    } catch (error) {

    }
}
const changePassword = async (req, res) => {
    try {
        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: 'error',
                message: parsed.error.issues.map((e) => e.message)
            });
        }
        const { current_password, new_password } = parsed.data;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan'
            });
        }
        const isCurrentPasswordValid = await compareValue(current_password, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Password saat ini tidak valid'
            });
        }
        const hashedPassword = await hashValue(new_password);
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            }
        });
        return res.status(200).json({
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    forgotPassword,
    verifyOtp,
    resetPassword,
    changePassword
};
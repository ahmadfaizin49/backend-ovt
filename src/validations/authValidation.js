const { z } = require('zod');

const registerSchema = z.object({
    full_name: z.string().min(3, 'Full name minimal 3 karakter'),
    user_name: z.string().min(3, 'Username minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone_number: z.string().min(10, 'Nomor HP minimal 10 karakter').optional(),
    basic_salary: z.number('Gaji pokok harus berupa angka').nonnegative('Gaji pokok tidak boleh negatif'),
    password: z.string()
        .min(6, 'Password minimal 6 karakter')
        .regex(/[A-Z]/, 'Password harus mengandung minimal satu huruf kapital')
        .regex(/[a-z]/, 'Password harus mengandung minimal satu huruf kecil')
        .regex(/[0-9]/, 'Password harus mengandung minimal satu angka')
})
const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter')
})

const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token wajib diisi')
})

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema
}   
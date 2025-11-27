const z = require('zod');
const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Email tidak valid')
        .min(1, 'Email wajib diisi')
});

const verifyOtpSchema = z.object({
    email: z.string()
        .email('Email tidak valid'),
    otp: z.string()
        .length(6, 'OTP harus terdiri dari 6 digit')
});

const resetPasswordSchema = z.object({
    email: z.string()
        .email('Email tidak valid'),
    otp: z.string().length(6, 'OTP harus terdiri dari 6 digit'),
    new_password: z.string()
        .min(6, 'Password minimal 6 karakter')
        .regex(/[A-Z]/, 'Password harus mengandung minimal satu huruf kapital')
        .regex(/[a-z]/, 'Password harus mengandung minimal satu huruf kecil')
        .regex(/[0-9]/, 'Password harus mengandung minimal satu angka')
});


const changePasswordSchema = z.object({
    current_password: z.string()
        .min(1, 'Password saat ini wajib diisi'),
    new_password: z.string()
        .min(6, 'Password minimal 6 karakter')
        .regex(/[A-Z]/, 'Password harus mengandung minimal satu huruf kapital')
        .regex(/[a-z]/, 'Password harus mengandung minimal satu huruf kecil')
        .regex(/[0-9]/, 'Password harus mengandung minimal satu angka')
});

module.exports = {
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema
};
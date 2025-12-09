const { z } = require('zod');


const updateProfileSchema = z.object({
    full_name: z.string().min(3, 'Full name minimal 3 karakter').optional(),
    user_name: z.preprocess((val) => (val === '' ? undefined : val), z.string().min(3, 'Username minimal 3 karakter').optional()),
    phone_number: z.string().min(10, 'Nomor HP minimal 10 karakter').optional(),
    basic_salary: z.coerce.number('Gaji pokok harus berupa angka')
        .nonnegative('Gaji pokok tidak boleh negatif').optional(),
    work_days: z.enum(['FIVE_DAYS', 'SIX_DAYS']).optional(),
    avatar: z.string().optional()

})
module.exports = {
    updateProfileSchema
}
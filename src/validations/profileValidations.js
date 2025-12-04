const { z } = require('zod');


const updateProfileSchema = z.object({
    full_name: z.string().min(3, 'Full name minimal 3 karakter'),
    user_name: z.string().min(3, 'Username minimal 3 karakter'),
    phone_number: z.string().min(10, 'Nomor HP minimal 10 karakter').optional(),
    basic_salary: z.coerce.number('Gaji pokok harus berupa angka')
        .nonnegative('Gaji pokok tidak boleh negatif'),
    avatar: z.string().optional()

})
module.exports = {
    updateProfileSchema
}
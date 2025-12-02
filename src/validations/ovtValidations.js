const { status } = require('@prisma/client');
const { z, date } = require('zod');
const { is } = require('zod/locales');

const ovtSchema = z.object({
    date: z.string().refine((val) => {
        const d = new Date(val);
        return !isNaN(d.getTime())
    }),
    status: z.enum([
        status.HOLIDAY,
        status.NORMAL
    ], { required_error: 'Status wajib diisi' }),
    hours: z.coerce.number({
        invalid_type_error: 'Jam lembur harus berupa angka',
        required_error: 'Jam lembur wajib diisi'
    }).nonnegative('Jam lembur tidak boleh negatif'),
})
module.exports = {
    ovtSchema
}

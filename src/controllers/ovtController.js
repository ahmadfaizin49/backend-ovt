
const prisma = require('../helper/prisma');

const { ovtSchema,
    ovtUpdateSchema
} = require('../validations/ovtValidations');
const { calculateOvertimeAmount } = require('../helper/overtime');

function normalizeDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

const createOvt = async (req, res) => {
    try {
        const userId = req.user.id;
        const parsedData = ovtSchema.safeParse(req.body);
        if (!parsedData.success) {
            const errors = parsedData.error.errors.map(err => err.message);
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: errors
            });
        }
        const data = parsedData.data;
        const dateObj = normalizeDate(data.date);

        const existingUser = await prisma.overtime.findFirst({
            where: {
                user_id: userId,
                date: dateObj
            }

        })
        if (existingUser) {
            return res.status(400).json({
                message: "Tanggal lembur sudah terdaftar. Tidak boleh duplikat."
            })
        }
        const totalAmount = calculateOvertimeAmount(
            data.status,
            data.hours,
            req.user.basic_salary
        )
        const ovt = await prisma.overtime.create({
            data: {
                user_id: userId,
                date: dateObj,
                status: data.status,
                hours: data.hours,
                total_amount: totalAmount
            }
        });

        return res.status(201).json({
            message: 'Overtime created successfully',
            data: ovt
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const updateOvt = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedData = ovtUpdateSchema.safeParse(req.body);
        if (!parsedData.success) {
            const errors = parsedData.error.errors.map(err => err.message);
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: errors
            });
        }
        const data = parsedData.data;
        const existingOvt = await prisma.overtime.findUnique({
            where: { id: Number(id) },
            include: { user: true }
        });
        if (!existingOvt) {
            return res.status(404).json({
                message: 'Overtime not found'
            });
        }
        const newDate = data.date ? normalizeDate(data.date) : undefined;
        const duplicat = await prisma.overtime.findFirst({
            where: {
                user_id: existingOvt.user_id,
                date: newDate,
                NOT: {
                    id: Number(id)
                }
            }
        });
        if (duplicat) {
            return res.status(400).json({
                message: 'Tanggal lembur sudah terdaftar. Tidak boleh duplikat.'
            });
        }
        const finalHours = data.hours !== undefined ? data.hours : existingOvt.hours;
        const finalStatus = data.status !== undefined ? data.status : existingOvt.status;

        const totalAmount = calculateOvertimeAmount(
            finalStatus,
            finalHours,
            existingOvt.user.basic_salary
        )
        const updatedOvt = await prisma.overtime.update({
            where: { id: Number(id) },
            data: {
                date: newDate,
                status: finalStatus,
                hours: finalHours,
                total_amount: totalAmount
            }
        });
        return res.status(200).json({
            message: 'Overtime updated successfully',
            data: updatedOvt
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}
module.exports = {
    createOvt,
    updateOvt
}
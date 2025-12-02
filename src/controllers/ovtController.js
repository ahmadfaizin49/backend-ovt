
const prisma = require('../helper/prisma');

const { ovtSchema } = require('../validations/ovtValidations');

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
        const dateObj = new Date(data.date)

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
        const hourlyWage = req.user.basic_salary / 173;
        let total = 0;
        if (data.status === 'NORMAL') {
            const firtsHour = 1;
            if (data.hours === firtsHour) {
                totalFirtsHour = hourlyWage * 1.5;
                total = totalFirtsHour;
            }
            if (data.hours > firtsHour) {
                const remainingHours = data.hours - firtsHour;
                total += hourlyWage * remainingHours * 2 + hourlyWage * 1.5;
            }
        } else if (data.status === 'HOLIDAY') {
            total = hourlyWage * data.hours * 2;
        }
        const totalAmount = Math.round(total);
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
module.exports = {
    createOvt
}
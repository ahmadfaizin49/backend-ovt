
const prisma = require('../helper/prisma');

const { ovtSchema,
    ovtUpdateSchema
} = require('../validations/ovtValidations');
const { calculateOvertimeAmount } = require('../helper/overtime');
const { getWeekRange } = require('../helper/date');
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

const deleteOvt = async (req, res) => {
    try {
        const { id } = req.params;
        const existingOvt = await prisma.overtime.findUnique({
            where: { id: Number(id) }
        });
        if (!existingOvt) {
            return res.status(404).json({
                message: 'Overtime not found'
            });
        }
        await prisma.overtime.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({
            message: 'Overtime deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const getReportMonthlyOvt = async (req, res) => {
    try {
        const userId = req.user.id;
        const summary = await prisma.$queryRaw`
        SELECT
           SUM(hours) as overtime_hours,
           SUM(total_amount) as total_overtime_amount
           FROM overtime
           WHERE user_id = ${userId}
           AND MONTH(date) = MONTH(CURRENT_DATE())
           AND YEAR(date) = YEAR(CURRENT_DATE());
           `
        const overtimeHour = summary[0].overtime_hours ?? 0;
        const total = summary[0].total_overtime_amount ?? 0;

        const data = await prisma.$queryRaw`
        SELECT
           id,
           user_id,
           date,
           hours,
           total_amount
           FROM overtime
           WHERE user_id = ${userId}
           AND MONTH(date) = MONTH(CURRENT_DATE())
           AND YEAR(date) = YEAR(CURRENT_DATE())
           ORDER BY date ASC;
           `


        const monthName = new Date().toLocaleString('id-ID', { month: 'long' });
        return res.status(200).json({
            message: "ok",
            data: {
                month: monthName,
                overtime_hours: Number(overtimeHour),
                total_overtime_amount: Number(total),
                total_found: data.length,
                records: data
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })

    }
}
const getReportWeeklyOvt = async (req, res) => {
    try {
        const userId = req.user.id;

        const rawData = await prisma.$queryRaw`
         SELECT
        DAYOFWEEK(date) AS dow,
        SUM(hours) AS overtime_hours,
        SUM(total_amount) AS total_overtime_amount
         FROM overtime
         WHERE user_id = ${userId}
         AND WEEK(date, 1) = WEEK(CURRENT_DATE(), 1)
         GROUP BY DAYOFWEEK(date)
`;
        console.log(rawData);

        const days = [
            { dow: 2, name: 'Senin' },
            { dow: 3, name: 'Selasa' },
            { dow: 4, name: 'Rabu' },
            { dow: 5, name: 'Kamis' },
            { dow: 6, name: 'Jumat' },
            { dow: 7, name: 'Sabtu' },
            { dow: 1, name: 'Minggu' }
        ];
        const result = days.map(day => {
            const found = rawData.find(r => Number(r.dow) === day.dow);
            return {
                day: day.name,
                overtime_hours: found ? Number(found.overtime_hours) : 0,
                total_overtime_amount: found ? Number(found.total_overtime_amount) : 0
            }
        })
        const currentWeekNumber = getCurrentWeekNumber();
        return res.status(200).json({
            message: "ok",
            week_number: currentWeekNumber,
            data: result
        })
    } catch (error) {

        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}
function getCurrentWeekNumber() {
    const today = new Date();
    const oneJan = new Date(today.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((today - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((today.getDay() + 1 + numberOfDays) / 7);
}
const getOvertimeDateRange = async (req, res) => {
    try {
        let { dateStart, dateEnd } = req.query;
        const userId = req.user.id;
        if (!dateStart || !dateEnd) {
            return res.status(400).json({
                message: "startDate and endDate are required"
            })
        }
        const [d1, m1, y1] = dateStart.split("-");
        const [d2, m2, y2] = dateEnd.split("-");

        const startDate = `${y1}-${m1}-${d1}`;
        const endDate = `${y2}-${m2}-${d2}`;

        const data = await prisma.$queryRaw`
        SELECT
           id,
           user_id,
           date,
           hours,
           total_amount
           FROM overtime
           WHERE user_id = ${userId}
           AND date BETWEEN ${startDate} AND ${endDate}
           ORDER BY date ASC;
           `
        const total = await prisma.$queryRaw`
        SELECT
           SUM(hours) as total_overtime_hours,
           SUM(total_amount) as total_overtime_amount
           FROM overtime
           WHERE user_id = ${userId}
           AND date BETWEEN ${startDate} AND ${endDate};
           `
        return res.status(200).json({
            message: "ok",
            dateStart,
            dateEnd,
            total_overtime_hours: total[0].total_overtime_hours,
            total_overtime_amount: total[0].total_overtime_amount,
            total_found: data.length,
            data
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}
module.exports = {
    createOvt,
    updateOvt,
    deleteOvt,
    getReportMonthlyOvt,
    getReportWeeklyOvt,
    getOvertimeDateRange
}
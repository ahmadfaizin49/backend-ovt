const prisma = require('../helper/prisma');
const { updateProfileSchema } = require('../validations/profileValidations');
const nodepath = require('path');
const fs = require('fs');

const getProfile = async (req, res) => {
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
                basic_salary: true,
                work_days: true,
                avatar: true,
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
        let parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: parsed.error.issues.map((e) => e.message)
            })
        }
        const data = parsed.data;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (data.user_name && data.user_name !== user.user_name) {
            const existingUserName = await prisma.user.findUnique({
                where: { user_name: data.user_name }
            });
            if (existingUserName) {
                return res.status(400).json({
                    message: 'Username sudah digunakan oleh user lain'
                });
            }
        }

        let avatarPath = user.avatar;

        if (avatarPath) {
            avatarPath = avatarPath.replace(/\\/g, '/');
            if (!avatarPath.startsWith('/')) {
                avatarPath = '/' + avatarPath;
            }
        }


        // REMOVE AVATAR
        if (req.body.removeAvatar === 'true' || req.body.removeAvatar === true) {

            if (avatarPath && typeof avatarPath === 'string') {
                const oldPath = nodepath.join(__dirname, '..', avatarPath);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            avatarPath = null;
        }

        // UPLOAD AVATAR BARU
        if (req.file) {

            if (avatarPath && typeof avatarPath === 'string') {
                const oldPath = nodepath.join(__dirname, '..', avatarPath);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            avatarPath = `/uploads/avatars/${req.file.filename}`;
        }

        const updatedData = {}
        if (data.full_name !== undefined) updatedData.full_name = data.full_name;
        if (data.user_name !== undefined) updatedData.user_name = data.user_name;
        if (data.phone_number !== undefined) updatedData.phone_number = data.phone_number;
        if (data.basic_salary !== undefined) updatedData.basic_salary = data.basic_salary;
        if (data.work_days !== undefined) updatedData.work_days = data.work_days;
        if (avatarPath !== undefined) updatedData.avatar = avatarPath;


        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                full_name: data.full_name,
                user_name: data.user_name,
                phone_number: data.phone_number,
                basic_salary: data.basic_salary,
                work_days: data.work_days,
                avatar: avatarPath
            }
        });

        return res.status(200).json({
            message: 'Profile updated successfully',
            data: updatedUser
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

module.exports = {
    getProfile,
    updateProfile
}
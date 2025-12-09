function calculateOvertimeAmount(status, hours, basicSalary, workingDays) {
    const hourlyWage = basicSalary / 173;
    let total = 0;
    if (status === 'NORMAL') {
        const firtsHour = 1;
        if (hours === firtsHour) {
            const totalFirtsHour = hourlyWage * 1.5;
            total = totalFirtsHour;

        }
        if (hours > firtsHour) {
            const remainingHours = hours - firtsHour;
            const totalFirtsHour = hourlyWage * 1.5;
            total = totalFirtsHour + (hourlyWage * remainingHours * 2);
        }
    } else if (status === 'HOLIDAY' && workingDays === 5) {
        if (hours <= 8) {
            total = hourlyWage * hours * 2;
        } else if (hours == 9) {
            const firstEightHours = hourlyWage * 8 * 2;
            const ninthHour = hourlyWage * 3;
            total = firstEightHours + ninthHour;
        } else if (hours > 9) {
            const firstEightHours = hourlyWage * 8 * 2;
            const ninthHour = hourlyWage * 3;
            const remainingHours = hours - 9;
            total = firstEightHours + ninthHour + (hourlyWage * remainingHours * 4);
        }
    } else if (status === 'HOLIDAY' && workingDays === 6) {
        if (hours <= 7) {
            total = hourlyWage * hours * 2;
        } else if (hours == 8) {
            const firstSevenHours = hourlyWage * 7 * 2;
            const eighthHour = hourlyWage * 3;
            total = firstSevenHours + eighthHour;
        } else if (hours > 8) {
            const firstSevenHours = hourlyWage * 7 * 2;
            const eighthHour = hourlyWage * 3;
            const remainingHours = hours - 8;
            total = firstSevenHours + eighthHour + (hourlyWage * remainingHours * 4);
        }
    }
    return total;
}
module.exports = {
    calculateOvertimeAmount
}
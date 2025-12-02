function calculateOvertimeAmount(status, hours, basicSalary) {
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
    } else if (status === 'HOLIDAY') {
        total = hourlyWage * hours * 2;
    }
    return total;
}
module.exports = {
    calculateOvertimeAmount
}
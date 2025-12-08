function getWeekRange(date = new Date()) {
    const currentDate = new Date(date);

    const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = (dayOfWeek + 6) % 7; // Days since Monday

    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { start: monday, end: sunday };
}
module.exports = { getWeekRange };
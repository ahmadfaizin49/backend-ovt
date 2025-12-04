const express = require('express');
const app = express();
const authRoute = require('./routes/authRoute');
const passwordRoute = require('./routes/passwordRoute');
const ovtRoute = require('./routes/ovtRoute');
const profileRoute = require('./routes/profileRoute');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());
//routes auth
app.use('/auth', authRoute);

//routes password
app.use('/password', passwordRoute);

//routes overtime
app.use('/ovt', ovtRoute);

//routes profile
app.use('/profile', profileRoute);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
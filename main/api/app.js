require('dotenv').config()

const authRoutes = require('./routes/authRoutes');
const sequelize = require('./lib/sequelize')

const express = require('express');
const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

app.use('*', function (req, res, next) {
    res.status(404).send({
        error: "Requested resource " + req.originalUrl + " does not exist"
    })
})

app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        error: "Server error.  Please try again later."
    })
})

const PORT = 5050;
sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("== Server is running on port", PORT)
    })
})
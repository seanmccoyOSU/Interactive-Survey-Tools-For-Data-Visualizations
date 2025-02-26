require('dotenv').config()

const userRoutes = require('./routes/users');
const sequelize = require('./lib/sequelize')

const express = require('express');
const app = express();
app.use(express.json());

// API routes
app.use('/users', userRoutes);

// catch-all for any undefined API endpoint
app.use('*', function (req, res, next) {
    res.status(404).send({
        error: "Requested resource " + req.originalUrl + " does not exist"
    })
})

// server error endpoint
app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        error: "Server error.  Please try again later."
    })
})

// start API server
const PORT = 5050;
sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("== Server is running on port", PORT)
    })
})
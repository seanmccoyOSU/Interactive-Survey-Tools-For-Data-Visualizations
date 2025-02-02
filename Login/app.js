require('dotenv').config()

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const sequelize = require('./lib/sequelize')

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'Login', 'views'))); // Serving static files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

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

const PORT = 5000;
sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("== Server is running on port", PORT)
    })
})
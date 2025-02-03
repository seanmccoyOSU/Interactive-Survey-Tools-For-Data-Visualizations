require('dotenv').config()

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { checkAuthentication } = require('./lib/auth')

const { User } = require('./model/User')

const sequelize = require('./lib/sequelize')

const app = express();

app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'Login', 'views'))); // Serving static files

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main.handlebars"
  }))
  app.set("view engine", "handlebars")

app.get('/', checkAuthentication, async (req, res) => {
    let user = null 
    
    if (req.userid)
        user = await User.findOne({ where: { id: req.userid }})

    const welcomeMessage = user ? `Hello, ${user.name}!` : ""

    res.render("home", {
        name: welcomeMessage
    })
});

app.get('/register', (req, res) => {
    res.render("register")
});

app.get('/login', (req, res) => {
    res.render("login")
});

app.use('*', function (req, res, next) {
    // res.status(404).send({
    //     error: "Requested resource " + req.originalUrl + " does not exist"
    // })
    res.render("404page")
    
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
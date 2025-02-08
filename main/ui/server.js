require('dotenv').config()

// express setup
const express = require('express');
const app = express();
app.use(express.json());

// setup required for processing cookies
const { wrapper } = require('axios-cookiejar-support')
const tough = require('tough-cookie');
const cookieJar = new tough.CookieJar();

// setup axios API interface
const API_URL = "http://localhost:5050"
const axios = require('axios');
const api = wrapper(axios.create({
    baseURL: API_URL,
    jar: cookieJar,
    withCredentials: true
}))

// body-parser setup
// needed to parse HTML form submissions for API requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// express-handlebars setup
// this dynamically renders pages
const exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: "main.handlebars"
  }))
  app.set("view engine", "handlebars")

// home page
app.get('/', async (req, res, next) => {
    try {
        const response = await api.get('/auth/users')

        let user = null 

        if (response.data.name)
            user = response.data.name

        const welcomeMessage = user ? `Hello, ${user}!` : ""

        res.render("home", {
            name: welcomeMessage
        })

    } catch (error) {
        if (error.response) {
            //console.log(error)
            res.render("home")
        } else {
            next(error)
        }       
    }
});

// register page
app.get('/register', (req, res) => {
    res.render("register")
});

// login page
app.get('/login', (req, res) => {
    res.render("login")
});

// login post request will be relayed to api
app.post('/auth/login', async (req, res, next) => {
    try {
        // relay post request to api
        const response = await api.post(req.originalUrl, req.body)

        // go back to home page
        res.redirect(req.protocol + "://" + req.get("host"))
        
    } catch (error) {
        if (error.response) {
            // re-render page with error message
            res.render("login", {
                error: "Invalid login credentials"
            })
        } else {
            next(error)
        }
        
    }
})

// logout post request will be relayed to api
app.post('/auth/logout', async (req, res, next) => {
    try {
        // relay to api
        const response = await api.post(req.originalUrl, req.body)

        // go back to home page
        res.redirect(req.protocol + "://" + req.get("host"))
        
    } catch (error) {
        next(error)
    }
})

// register post request will be relayed to api
app.post('/auth', async (req, res, next) => {
    try {
        // relay post request to api
        const response = await api.post(req.originalUrl, req.body)

        // go back to home page
        res.redirect(req.protocol + "://" + req.get("host"))
        
    } catch (error) {
       if (error.response) {
            // re-render page with error message
            res.render("register", {
                error: "Invalid registration credentials or user already exists"
            })
        } else {
            next(error)
        }
    }
})

// anything else is 404
app.use('*', function (req, res, next) {
    res.render("404page")  
})

// error case
app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        error: "Server error.  Please try again later."
    })
})

// start server
const PORT = 5000;
app.listen(PORT, function () {
    console.log("== Server is running on port", PORT)
})
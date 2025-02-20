require('dotenv').config()

// express setup
const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, "public")))

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
app.set('views', path.join(__dirname, 'views'));
const exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: "main.handlebars",
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
}))
app.set("view engine", "handlebars")

// map certain API endpoints to name of page to render
const apiPageNames = {
    '/users': 'register',
    '/users/login': 'login'
}

// Default path
// when there is not path in the URL, go to generic homepage or user dashboard
app.get('/', async (req, res, next) => {
    let user = null
    
    try {
        // get user info
        const response = await api.get('/users')
        user = response.data
    } catch (error) {
        if (error.response) {
            // if not logged in, display generic home page
            res.render("home")
        } else {
            next(error)
        }
    }

    /*
    * TODO BELOW FOR SURVEY DESIGNS: get user survey designs, then render them to the dashboard page (requires editing dashboard.handlebars)
    */

    // if logged in, display user dashboard
    if (user) {
        try {
            // get user visualizations
            const response = await api.get(`/users/${user.id}/visualizations`)

            res.render("dashboard", {
                name: user.name,
                visualizations: response.data
            })
    
        } catch (error) {
            res.render("dashboard", {
                name: user.name,
                visError: "Unable to load visualizations."
            })
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

// handles what to do on ui create visualization
app.post('/visualizations', async (req, res, next) => {
    try {
        // relay post request to api
        const response = await api.post(req.originalUrl, req.body)

        // on success, refresh page
        res.redirect(req.protocol + "://" + req.get("host"))

    } catch (error) {
        next(error)
    }
})

// handles what to do on ui delete visualization
app.delete('/visualizations/:id', async (req, res, next) => {
    try {
        // relay delete request to api
        const response = await api.delete(req.originalUrl, req.body)
    } catch (error) {
        next(error)
    }
})


// handles what to do on ui registration, login, or logout
app.post('/users(/*)?', async (req, res, next) => {
    try {
        // relay post request to api
        const response = await api.post(req.originalUrl, req.body)

        // on success, go back to home page
        res.redirect(req.protocol + "://" + req.get("host"))

    } catch (error) {
        if (error.response) {
            // on fail, re-render page with error message
            res.render(apiPageNames[req.originalUrl], {
                error: error.response.data.msg
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
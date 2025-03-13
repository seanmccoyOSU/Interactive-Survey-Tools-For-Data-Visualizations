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
const axios = require('axios');
const api = (process.argv[2] == "-debug") ? (
    // if running in debug mode, use fake debug API
    require('./debugApi')
) : (
    // else, use the real API
    wrapper(axios.create({
        baseURL: process.env.MAIN_API_URL,
        jar: cookieJar,
        withCredentials: true
    }))
)

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

// some browsers request this automatically, ignoring for now
app.get('/favicon.ico', (req, res, next) => {
    console.log("ignoring favicon request")
    return
})



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

    // if logged in, display user dashboard
    if (user) {
        try {
            // get user visualizations
            const userVisualizations = await api.get(`/users/${user.id}/visualizations`)
            const userSurveyDesigns = await api.get(`/users/${user.id}/surveyDesigns`)
                        
            res.render("dashboard", {
                name: user.name,
                visualizations: userVisualizations.data.visualizations,
                surveyDesigns: userSurveyDesigns.data.surveyDesigns,
            })
    
        } catch (error) {
            res.render("dashboard", {
                name: user.name,
                visError: "Unable to load visualizations.",
                surError: "Unable to load survey designs.",
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
                error: error.response.data.error
            })
        } else {
            next(error)
        }
    }
})

// page of specific visualization
app.get('/visualizations/:id', async (req, res, next) => {
    try {
        // relay post request to api
        const response = await api.get(req.originalUrl)

        // on success, refresh page
        res.render("visualization", {
            name: response.data.name,
            id: response.data.contentId
        })

    } catch (error) {
        next(error)
    }
});

// Edit survey design
app.get('/surveyDesigns/:id', async (req, res, next) => {
    try {
        const response = await api.get(req.originalUrl)
        const questionResponse = await api.get(req.originalUrl + "/questions")
        
        res.render("editsurveydesign", {
            name: response.data.name,
            id: response.data.id,
            title: response.data.title,
            introText: response.data.introText,
            questions: questionResponse.data.questions,
            conclusionText: response.data.conclusionText,
        })

    } catch (error) {
        next(error)
    }
});

// handle ui buttons for POST, PATCH, and DELETE for user resource collections (such as visualizations, survey designs)
app.use('/:resource', async (req, res, next) => {
    let response

    try {
        // relay request to api
        switch (req.method) {
            case 'POST':
                response = await api.post(req.originalUrl, req.body)
                break;
            case 'PATCH':
                response = await api.patch(req.originalUrl, req.body)
                break;
            case 'DELETE':
                response = await api.delete(req.originalUrl, req.body)
                break;
            default:
                next()
                return
        }

        if (req.body.name) {
            // creating a new object for the main user collections doesn't have its own redirect, this refreshes
            res.redirect(req.get('Referrer'))
        } else {
            res.send()
        }
        
    } catch (error) {
        next(error)
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
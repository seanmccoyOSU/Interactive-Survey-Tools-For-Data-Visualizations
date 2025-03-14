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
    let response

    try {
        response = await api.get(req.originalUrl)
    } catch (error) {
        next(error)
    }

    try {
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
        res.render("editsurveydesign", {
            name: response.data.name,
            id: response.data.id,
            title: response.data.title,
            introText: response.data.introText,
            questionError: "Unable to load questions",
            conclusionText: response.data.conclusionText,
        })
    }
        

    
});

// Edit survey question
app.get('/questions/:id', async (req, res, next) => {
    try {
        const response = await api.get(req.originalUrl)
        
        res.render("editquestion", {
            number: response.data.number,
            id: response.data.id,
            surveyDesignId: response.data.surveyDesignId,
            text: response.data.text,
            multipleChoice: response.data.type == "Multiple Choice" ? "selected" : "",
            shortAnswer: response.data.type == "Short Answer" ? "selected" : "",
            choices: response.data.choices,
            min: response.data.min,
            max: response.data.max,
            required: response.data.required ? "checked" : "",
            allowComment: response.data.allowComment ? "checked" : "",
        })

    } catch (error) {
        next(error)
    }
});

// handle ui button for saving questions
app.post('/questions/:id/PATCH', async (req, res, next) => {
    try {
        // convert to boolean before send
        req.body.allowComment = !!req.body.allowComment
        req.body.required = !!req.body.required

        const response = await api.patch(req.originalUrl.split('/PATCH')[0], req.body)
        res.redirect(req.get('Referrer'))
    } catch (error) {
        next(error)
    }
})

// links for taking surveys
app.get('/takeSurvey/:hash', async (req, res, next) => {
    try {
        const response = await api.get(`/publishedSurveys/${req.params.hash}`)

        if (req.query.page && req.query.page < response.data.questions.length+2) {
            if (req.query.page == response.data.questions.length+1) {
                res.render("takeSurveyConclusion", {
                    layout: false,
                    conclusionText: response.data.surveyDesign.conclusionText,
                })
            } else {
                const question = response.data.questions.filter(obj => obj.number == req.query.page)[0]

                res.render("takeSurveyPage", {
                    layout: false,
                    linkHash: response.data.linkHash,
                    text: question.text,
                    number: question.number,
                    prev: question.number-1,
                    next: question.number+1,
                    nextText: (question.number == response.data.questions.length) ? "Finish & Submit" : "Next Question",
                })
            }
        } else if (!req.query.page) {
            res.render("takeSurveyWelcome", {
                layout: false,
                linkHash: response.data.linkHash,
                title: response.data.surveyDesign.title,
                introText: response.data.surveyDesign.introText
            })
        } else {
            next()
        }

        
    } catch (error) {
        next(error)
    }
})


// handle ui buttons for POST, PATCH, and DELETE for user resource collections (such as visualizations, survey designs)
app.post('/:resource/:id?/:method?', async (req, res, next) => {
    let response

    try {
        // relay request to api
        switch (req.params.method) {
            case 'PATCH':
                response = await api.patch(req.originalUrl.split('/PATCH')[0], req.body)
                break;
            case 'DELETE':
                response = await api.delete(req.originalUrl.split('/DELETE')[0], req.body)
                break;
            case 'POST':
                response = await api.post(req.originalUrl.split('/POST')[0], req.body)
                break;
            default:
                response = await api.post(req.originalUrl, req.body)
        }

        // refresh
        res.redirect(req.get('Referrer'))
        
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
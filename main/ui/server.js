require('dotenv').config()
const { Parser } = require('json2csv');

// express setup
const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, "public"), { extensions: ['html'] }))

// setup required for processing cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// setup axios API interface
const DEBUG = process.argv[2] == "-debug"
const axios = require('axios');
const api = (DEBUG) ? (
    // if running in debug mode, use fake debug API
    require('./debugApi')
) : (
    // else, use the real API
    axios.create({
        baseURL: process.env.MAIN_API_URL
    })
)

// use this function as a parameter in an API call to send auth data
// this function just returns the authorization header using the parameter 'token'
function withAuth(token) {
    return { headers: { Authorization: `Bearer ${token}` } }
}

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



// some browsers request this automatically, ignoring for now
app.get('/favicon.ico', (req, res, next) => {
    return
})


// Default path
// when there is not path in the URL, go to generic homepage or user dashboard
app.get('/', async (req, res, next) => {
    let user = null
    
    try {
        // get user info
        const response = await api.get('/users', withAuth(req.cookies.access_token))
        user = response.data
    } catch (error) {
        if (error.response) {
            // if not logged in, display generic home page
            res.sendFile(path.join(__dirname, "public/home.html"))
        } else {
            next(error)
        }
    }

    // if logged in, display user dashboard
    if (user) {
        // get user visualizations
        let userVisualizations
        let userSurveyDesigns
        let userPublishedSurveys

        let visError = ""
        let surError = ""
        let pSurError = ""

        try {
            userVisualizations = await api.get(`/users/${user.id}/visualizations`, withAuth(req.cookies.access_token))
        } catch {
            visError = "Unable to load visualizations."
        }
        
        try {
            userSurveyDesigns = await api.get(`/users/${user.id}/surveyDesigns`, withAuth(req.cookies.access_token))
        } catch {
            surError = "Unable to load survey designs."
        }

        try {
            userPublishedSurveys = await api.get(`/users/${user.id}/publishedSurveys`, withAuth(req.cookies.access_token))
        } catch {
            pSurError = "Unable to load published surveys."
        }
                    
        res.render("dashboard", {
            name: user.name,
            visualizations: userVisualizations?.data.visualizations,
            surveyDesigns: userSurveyDesigns?.data.surveyDesigns,
            publishedSurveys: userPublishedSurveys?.data.publishedSurveys,
            visError: visError,
            surError: surError,
            pSurError: pSurError
        })
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

    // map certain API endpoints to name of page to render
    const apiPageNames = {
        '/users': 'register',
        '/users/login': 'login'
    }

    try {
        // relay post request to api
        const response = await api.post(req.originalUrl, req.body)

        // save credentials as a cookie
        res.cookie("access_token", response.data.token, { httpOnly: true })

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
        const response = await api.get(req.originalUrl, withAuth(req.cookies.access_token))

        // on success, refresh page
        res.render("visualization", {
            name: response.data.name,
            id: response.data.contentId,
            visualURL: process.env.VISUAL_UI_URL
        })

    } catch (error) {
        next(error)
    }
});

// Edit survey design
app.get('/surveyDesigns/:id', async (req, res, next) => {
    let response = null

    try {
        response = await api.get(req.originalUrl, withAuth(req.cookies.access_token))
    } catch (error) {
        next(error)
    }

    if (response) {

        const localOffset = new Date(Date.now()).getTimezoneOffset()
        const today = new Date(Date.now() - (localOffset * 60000))
        const tomorrow = new Date(Date.now() + 86400000 - (localOffset * 60000))

        try {
            const questionResponse = await api.get(req.originalUrl + "/questions", withAuth(req.cookies.access_token))
            
            res.render("editsurveydesign", {
                name: response.data.name,
                id: response.data.id,
                title: response.data.title,
                introText: response.data.introText,
                questions: questionResponse.data.questions,
                conclusionText: response.data.conclusionText,
                today: today.toISOString().substring(0, 16),
                tomorrow: tomorrow.toISOString().substring(0, 16)
            })
        } catch (error) {
            res.render("editsurveydesign", {
                name: response.data.name,
                id: response.data.id,
                title: response.data.title,
                introText: response.data.introText,
                questionError: "Unable to load questions",
                conclusionText: response.data.conclusionText,
                today: today.toISOString().substring(0, 16),
                tomorrow: tomorrow.toISOString().substring(0, 16)
            })
        }
    }

    
});

// button for publishing survey design
app.post('/surveyDesigns/:id/publishedSurveys', async (req, res, next) => {
    try {
        await api.post(req.originalUrl, req.body, withAuth(req.cookies.access_token))
        res.redirect(req.protocol + "://" + req.get("host"))
    } catch (error) {
        next(error)
    }
})

// Edit survey question
app.get('/questions/:id', async (req, res, next) => {
    try {
        const questionTypes = (await import("./public/src/questionTypes.mjs")).default
        const response = await api.get(req.originalUrl, withAuth(req.cookies.access_token))
        const designResponse = await api.get(`/surveyDesigns/${response.data.surveyDesignId}`, withAuth(req.cookies.access_token))
        const visualResponse = await api.get(`/users/${designResponse.data.userId}/visualizations`, withAuth(req.cookies.access_token))

        let editQuestionTypes = []
        for (const type of questionTypes) {
            editQuestionTypes.push({
                name: type.name,
                label: type.label,
                selected: response.data.type == type.name
            })
        }
        
        res.render("editquestion", {
            layout: false,
            number: response.data.number,
            id: response.data.id,
            surveyDesignId: response.data.surveyDesignId,
            text: response.data.text,
            questionTypes: editQuestionTypes,
            choices: response.data.choices,
            min: response.data.min,
            max: response.data.max,
            visualizations: visualResponse.data.visualizations,
            visualizationContentId: response.data.visualizationContentId,
            required: response.data.required,
            allowComment: response.data.allowComment,
            visualURL: process.env.VISUAL_UI_URL,
            DEBUG: DEBUG
        })

    } catch (error) {
        next(error)
    }
});

// View published survey
app.get('/publishedSurveys/:id', async (req, res, next) => {
    try {
        const response = await api.get(req.originalUrl, withAuth(req.cookies.access_token))
        let openDateTime
        let closeDateTime
        if (response.data.openDateTime instanceof Date) {
            openDateTime = response.data.openDateTime
        } else {
            openDateTime = new Date(response.data.openDateTime)
        }

        if (response.data.closeDateTime instanceof Date) {
            closeDateTime = response.data.closeDateTime
        } else {
            closeDateTime = new Date(response.data.closeDateTime)
        }

        if (req.query.downloadCSV) {
            const { data: pub } = await api.get(req.originalUrl, withAuth(req.cookies.access_token))
            const participants = pub.results?.participants || []
            // build one flat row per answer
            const records = []
            participants.forEach(p =>
              p.answers.forEach(a => {
                records.push({
                  participantId:    p.participantId,
                  questionNumber:   a.questionNumber,
                  response:         a.response,
                  comment:          a.comment
                })
              })
            )
      
            // defines column order
            const fields = [
              'participantId','questionNumber','response','comment'
            ]
            const parser = new Parser({ fields })
            const csv    = parser.parse(records)

            return res
            .status(200)
            .set({
              'Content-Type':        'text/csv',
              'Content-Disposition': `attachment; filename="${pub.name.replace(/\W+/g,'_')}-${pub.status}-results.csv"`
            })
            .send(csv)
        }

        else {
            res.render('publishedSurvey', {
                name: response.data.name,
                openDateTime: openDateTime,
                closeDateTime: closeDateTime,
                status: response.data.status,
                url: process.env.MAIN_UI_URL + '/takeSurvey/' + response.data.linkHash
            })
        }

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

        const response = await api.patch(req.originalUrl.split('/PATCH')[0], req.body, withAuth(req.cookies.access_token))
        res.redirect(req.get('Referrer'))
    } catch (error) {
        next(error)
    }
})

// links for taking surveys
app.get('/takeSurvey/:hash', async (req, res, next) => {
    try {
        const response = await api.get(req.originalUrl)

        if (req.query.page && req.query.page < response.data.questions.length+2 && req.query.page > 0) {
            if (req.query.page == response.data.questions.length+1) {
                res.render("takeSurveyConclusion", {
                    layout: false,
                    conclusionText: response.data.surveyDesign.conclusionText,
                })

                // when this page is loaded, send cookie data to API
            
                const parsedAnswers = JSON.parse(req.cookies.answers)
                await api.patch(req.originalUrl, { answers: parsedAnswers.answers })
            } else {
                const questionTypes = (await import("./public/src/questionTypes.mjs")).default
                const question = response.data.questions.filter(obj => obj.number == req.query.page)[0]

                let comment = ""
                let userResponse = ""
                if (req.cookies.answers) {
                    const parsedAnswers = JSON.parse(req.cookies.answers)

                    if (parsedAnswers.hash == req.params.hash) {
                        const matchingAnswers = parsedAnswers.answers.filter(obj => obj?.questionNumber == question.number)

                        if (matchingAnswers.length > 0) {
                            const match = matchingAnswers[0]
                            comment = match.comment
                            userResponse = match.response
                        }
                    }
                }

                const typeInfo = questionTypes.filter(type => type.name == question.type)[0]

                let choices = []
                if (typeInfo.hasChoices) {
                    const qChoices = question.choices.split('|')
                    const userSelections = userResponse.split('|')

                    for (let i = 0; i < qChoices.length; i++)
                        choices.push({ id: `choice${i}`, choice: qChoices[i], checked: userSelections.includes(qChoices[i]) })
                }        

                res.render("takeSurveyPage", {
                    layout: false,
                    linkHash: response.data.linkHash,
                    text: question.text,
                    visualURL: process.env.VISUAL_UI_URL,
                    visualModeLabel: typeInfo.visualModeLabel,
                    visualizationContentId: question.visualizationContentId,
                    number: question.number,
                    progress: question.number-1,
                    total: response.data.questions.length,
                    percent: (((question.number-1) / response.data.questions.length) * 100).toFixed(2),
                    choices: choices,
                    prompt: typeInfo.getPromptString(question.min, question.max),
                    allowComment: question.allowComment,
                    min: question.min,
                    max: question.max,
                    required: question.required,
                    questionType: question.type,
                    comment: comment,
                    response: userResponse,
                    prev: question.number-1,
                    next: question.number+1,
                    nextText: (question.number == response.data.questions.length) ? "Finish & Submit" : "Next Question",
                    DEBUG: DEBUG,
                    ...typeInfo?.pageRenderOptions
                })
            }
        } else if (!req.query.page || req.query.page == 0) {
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

// for saving cookie data while taking survey
app.patch('/takeSurvey/:hash', async (req, res, next) => {
    let answers = null
    if (req.cookies.answers) {
        answers = JSON.parse(req.cookies.answers)
    }

    if (!answers || answers.hash != req.params.hash) {
        answers = { hash: req.params.hash, answers: [] }
    }

    let isReplacement = false
    for (let i = 0; i < answers.answers.length && !isReplacement; i++) {
        if (answers.answers[i] && answers.answers[i].questionNumber == req.body.answer.questionNumber) {
            answers.answers[i] = req.body.answer
            isReplacement = true
        }
    }

    if (!isReplacement)
        answers.answers.push(req.body.answer)

    res.cookie("answers", JSON.stringify(answers), { httpOnly: true })
    res.send()
})

// handle ui buttons for POST, PATCH, and DELETE for user resource collections (such as visualizations, survey designs)
app.post('/:resource/:id?/:method?', async (req, res, next) => {
    let response

    try {
        // relay request to api
        switch (req.params.method) {
            case 'PATCH':
                response = await api.patch(req.originalUrl.split('/PATCH')[0], req.body, withAuth(req.cookies.access_token))
                break;
            case 'DELETE':
                response = await api.delete(req.originalUrl.split('/DELETE')[0], withAuth(req.cookies.access_token))
                break;
            case 'POST':
                response = await api.post(req.originalUrl.split('/POST')[0], req.body, withAuth(req.cookies.access_token))
                break;
            default:
                response = await api.post(req.originalUrl, req.body, withAuth(req.cookies.access_token))
        }

        // refresh
        res.redirect(req.get('Referrer'))
        
    } catch (error) {
        next(error)
    }
})


// anything else is 404
app.use('*', function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/404.html"))
})

// error case
app.use('*', function (err, req, res, next) {
    switch(err.response?.status) {
        case 400:
            res.sendFile(path.join(__dirname, "public/badrequest.html"))
            break;
        case 401:
        case 403:
            res.sendFile(path.join(__dirname, "public/unauthorized.html"))
            break;
        case 404:
            res.sendFile(path.join(__dirname, "public/404.html"))
            break;
        default:
            console.error("== Error:", err)
            res.sendFile(path.join(__dirname, "public/internalerror.html"))
    }
})

// start server
app.listen(process.env.MAIN_UI_PORT, '0.0.0.0', function () {
    console.log("== Server is running on port", process.env.MAIN_UI_PORT)
});
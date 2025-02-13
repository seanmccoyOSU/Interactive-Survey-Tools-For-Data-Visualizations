require('dotenv').config()

// set up express
const express = require('express')
const app = express()
const path = require('path')
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// setup axios API interface
const API_URL = "http://localhost:8080"
const axios = require('axios');
const api = axios.create({
    baseURL: API_URL
})

// express-handlebars setup
// this dynamically renders pages
app.set('views', path.join(__dirname, 'views'));
const exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: false
}))
app.set("view engine", "handlebars")

// default/debug endpoint
app.get('/', function(req,res,next) {
    // role must be editor to load default page
    if (req.query.editor) {
        res.render("visualizer", {
            role: "editor"
        })
    } else {
        console.log("loading debug page")
        res.render("visualizer")
    }
})

// ui post
app.post('/', async function(req,res,next) {
    try {
        const response = await api.post(req.originalUrl, req.body)
        console.log("visualization ID: ", response.data.id)
    } catch (e) {
        next(e)
    }
})

// endpoint to load specific visualization
app.get('/:id', async function(req,res,next) {
    try {
        const response = await api.get(`/${req.params.id}`)
        if (req.query.editor) {
            res.render("visualizer", {
                role: "editor",
                svg: response.data.svg
            })
        } else {
            res.render("visualizer", {
                svg: response.data.svg
            })
        }
    } catch (e) {
        next(e)
    }
})

// catch-all
app.use('*', function (req, res, next) {
    res.status(404).send({
        error: "Requested resource " + req.originalUrl + " does not exist"
    })
})

// error case
app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        error: "Server error.  Please try again later."
    })
})

// start server
const port = 8000
app.listen(port, function () {
    console.log("== Server is running on port", port)
})
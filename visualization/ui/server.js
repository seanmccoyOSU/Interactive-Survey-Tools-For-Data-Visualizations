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
    res.render("visualizer")
})

// endpoint to load specific visualization
app.get('/{id}', function(req,res,next) {
    res.render("visualizer")
})

const port = 8000
app.listen(port, function () {
    console.log("== Server is running on port", port)
})
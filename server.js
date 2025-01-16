const express = require('express')

const port = 8000

const app = express()
const path = require('path')

app.use(express.json())

app.use(express.static('public'))

app.get('/', function(req,res,next) {
    const options = {
        root: path.join(__dirname, "public")
    };

    res.status(200).sendFile("visualizer.html", options)
})

app.listen(port, function () {
    console.log("== Server is running on port", port)
})
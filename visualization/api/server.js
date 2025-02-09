require('dotenv').config()

// database imports
const { ValidationError } = require('sequelize')
const { Visualization, VisualClientFields } = require('./model/Visualization')

const sequelize = require('./lib/sequelize')

const express = require('express');
const app = express();
app.use(express.json());

// Get visualization info with ID {id}
app.get('/{id}', async (req, res, next) => {
    try {
		// find visualization with matching id and return info
		const visualization = await Visualization.findOne({ where: { id: req.params.id } })
		res.status(200).send({ svg: visualization.svg })
	} catch (e) {
		next(e)
	}
})

// Create new visualization
app.post('/', async (req, res, next) => {
    try {
        const visualization = await Visualization.create(req.body, VisualClientFields)
        res.status(201).send({id: visualization.id})
    } catch (e) {
        if (e instanceof ValidationError) {
            // attempted to create a bad visualization
            res.status(400).send({
                msg: "Invalid input"
            })
        } else {
            next(e)
        }
    }
})

// catch-all for any undefined API endpoint
app.use('*', function (req, res, next) {
    res.status(404).send({
        error: "Requested resource " + req.originalUrl + " does not exist"
    })
})

// server error endpoint
app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        error: "Server error.  Please try again later."
    })
})

// start API server
const PORT = 8080;
sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("== Server is running on port", PORT)
    })
})
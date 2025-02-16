// database imports
const { ValidationError } = require('sequelize')
const { User } = require('../model/User')
const { requireAuthentication } = require('../lib/auth')

// setup express router
const express = require('express');
const { Visualization, VisualClientFields } = require('../model/Visualization');
const router = express.Router();

// Create new visualization
router.post('/', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
		const visualData = {};
			for (const field of VisualClientFields) {
				if (req.body[field]) {
					visualData[field] = req.body[field];
				}
			}
		
		const visualization = await Visualization.create(visualData);
		res.status(201).send({
			id: visualization.id
		});
	} catch (e) {
		if (e instanceof ValidationError) {
			res.status(400).send({
				msg: "Invalid input"
			});
		} else {
			next(e)
		}
	}
})

// Get info of specific visualization
router.get('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
		const visualization = await Visualization.findOne({ where : { id: req.params.id }})

		if (visualization) {
			res.setHeader('Content-Type', 'image/svg+xml');
			res.status(200).send(visualization.svg);
		} else {
			res.status(404).send({ 
				msg: "Visualization not found"
			})
		}
	} catch (e) {
		next(e)
	}
})

// Delete specific visualization
router.delete('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
		const visualization = await Visualization.findOne({ where : { id: req.params.id }})
		if (visualization) {
			await visualization.destroy();
			res.status(200).send({ 
				msg: "Visualization deleted"
			})
		} else {
			res.status(404).send({ 
				msg: "Visualization not found"
			})
		}
	} catch (e) {
		next(e)
	}
})

module.exports = router;
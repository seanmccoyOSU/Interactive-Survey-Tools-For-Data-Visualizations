// database imports
const { ValidationError } = require('sequelize')
const { User } = require('../model/User')
const { SurveyDesign, SurveyDesignClientFields } = require('../model/SurveyDesign')
const { requireAuthentication } = require('../lib/auth')

// setup express router
const express = require('express');
const router = express.Router();

// Create new survey design
router.post('/', requireAuthentication, async (req, res, next) => {
	try {
		console.log(req.body)
		// const user = await User.findOne({ where: { id: req.userid } })
		res.status(200).send({body: req.body})
	} catch (e) {
		next(e)
	}
})

// Get specific survey design info
router.get('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
	} catch (e) {
		next(e)
	}
})

// Delete specific survey design
router.delete('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
	} catch (e) {
		next(e)
	}
})

module.exports = router;
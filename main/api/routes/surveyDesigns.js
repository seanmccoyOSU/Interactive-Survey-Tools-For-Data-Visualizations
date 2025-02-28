// database imports
const { ValidationError } = require('sequelize')
const { User } = require('../model/User')
const { SurveyDesign, SurveyDesignClientFields } = require('../model/SurveyDesign')
const { requireAuthentication } = require('../lib/auth')

// setup express router
const express = require('express');
const router = express.Router();

// setup cookie parser
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Create new survey design
router.post('/', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
		next() // 404
	} catch (e) {
		next(e)
	}
})

// Get specific survey design info
router.get('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
		next() // 404
	} catch (e) {
		next(e)
	}
})

// Delete specific survey design
router.delete('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
		next() // 404
	} catch (e) {
		next(e)
	}
})

module.exports = router;
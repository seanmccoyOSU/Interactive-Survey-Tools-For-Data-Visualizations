// database imports
const { User } = require('../model/User')
const { SurveyDesign, SurveyDesignClientFields } = require('../model/SurveyDesign')
const { requireAuthentication } = require('../lib/auth')
const { handleErrors, getResourceById } = require('../lib/error')

// setup express router
const express = require('express');
const router = express.Router();

// setup cookie parser
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Create new survey design
router.post('/', requireAuthentication, handleErrors( async (req, res, next) => {
	// TODO
	next() // 404
}))

// Get specific survey design info
router.get('/:id', requireAuthentication, handleErrors( async (req, res, next) => {
	// TODO
	next() // 404
}))

// Delete specific survey design
router.delete('/:id', requireAuthentication, handleErrors( async (req, res, next) => {
	// TODO
	next() // 404
}))

module.exports = router;
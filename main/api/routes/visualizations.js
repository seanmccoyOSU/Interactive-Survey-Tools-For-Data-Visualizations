// database imports
const { ValidationError } = require('sequelize')
const { User } = require('../model/User')
const { requireAuthentication } = require('../lib/auth')

// setup express router
const express = require('express');
const router = express.Router();

// Create new visualization
router.post('/', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
	} catch (e) {
		next(e)
	}
})

// Get info of specific visualization
router.get('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
	} catch (e) {
		next(e)
	}
})

// Delete specific visualization
router.delete('/:id', requireAuthentication, async (req, res, next) => {
	try {
		// TODO
	} catch (e) {
		next(e)
	}
})

module.exports = router;
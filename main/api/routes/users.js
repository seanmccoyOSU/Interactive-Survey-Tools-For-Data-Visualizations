// database imports
const { ValidationError } = require('sequelize')
const { Visualization } = require('../model/Visualization')
const { User, UserClientFields, validateCredentials } = require('../model/User')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

// setup express router
const express = require('express');
const router = express.Router();

// setup cookie parser
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Get current user info
router.get('/', requireAuthentication, async (req, res, next) => {
	try {
		// find user with matching id and return info
		const user = await User.findOne({ where: { id: req.userid } })
		res.status(200).send({ id: user.id, name: user.name })
	} catch (e) {
		next(e)
	}
})

// Get visualizations belonging to user
router.get('/:id/visualizations', requireAuthentication, async (req, res, next) => {
	// verify correct id
	if (req.userid != req.params.id) {
		res.status(401).send({
			error: "You are not allowed to access this resource"
		})
	} else {
		try {
			// TODO: get user's visualizations (fin)
			const visualizations = await Visualization.findAll({ where: { userId: req.params.id} })	

			res.status(200).json(visualizations);	// sending as json response
		} catch (e) {
			next(e)
		}
	}


})

// Get survey designs belonging to user
router.get('/:id/surveyDesigns', requireAuthentication, async (req, res, next) => {
	// verify correct id
	if (req.userid != req.params.id) {
		res.status(401).send({
			error: "You are not allowed to access this resource"
		})
	} else {
		try {
			// TODO: get user's survey designs

			next()	// goes to 404 right now
		} catch (e) {
			next(e)
		}
	}
})

// Register a new user
router.post('/', async (req, res, next) => {
	try {
		// create new user entry in database
		const user = await User.create(req.body, UserClientFields)
		res.status(201).send({ id: user.id })
	} catch (e) {
		if (e instanceof ValidationError) {
			// user entered bad credentials for registration
			res.status(400).send({
				error: "Invalid input or user already exists"
			})
		} else {
			next(e)
		}
	}
});

// Login user
router.post('/login', async (req, res, next) => {
	try {
		// attempt login with given credentials
		const authenticated = await validateCredentials(req.body.name, req.body.password)
		if (authenticated) {
			// find user with matching name
			const user = await User.findOne({ where: { name: req.body.name } })
			// send authentication token back as a cookie
			// this token lets API know who the user is and whether they have an authenticated login 
			const token = generateAuthToken(user.id)
			res.cookie("access_token", token, { httpOnly: true })
			res.status(200).send()
		} else {
			// invalid login attempt
			res.status(401).send({
				error: "Invalid login credentials"
			})
		}
	} catch (e) {
		next(e)
	}
});

// logout user
router.post('/logout', async (req, res, next) => {
	try {
		// simply get rid of the authentication token
		res.cookie("access_token", null, { httpOnly: true })
		res.status(200).send()
	} catch (e) {
		next(e)
	}
});

module.exports = router;
// database imports
const { Visualization } = require('../model/Visualization')
const { User, UserClientFields, validateCredentials } = require('../model/User')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')
const { handleErrors, getResourceById } = require('../lib/error')

// setup express router
const express = require('express');
const router = express.Router();

// setup cookie parser
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Get current user info
router.get('/', requireAuthentication, handleErrors( async (req, res, next) => {
	// find user with matching id and return info
	const user = await getResourceById(User, req.userid)
	res.status(200).send({ id: user.id, name: user.name })
}))

// Get visualizations belonging to user
router.get('/:id/visualizations', requireAuthentication, handleErrors( async (req, res, next) => {
	// verify correct id
	if (req.userid != req.params.id) {
		res.status(401).send({
			error: "You are not allowed to access this resource"
		})
	} else {
		const visualizations = await Visualization.findAll({ where: { userId: req.params.id} })	

		res.status(200).send({visualizations: visualizations});	// sending as json response
	}
}))

// Get survey designs belonging to user
router.get('/:id/surveyDesigns', requireAuthentication, handleErrors( async (req, res, next) => {
	// verify correct id
	if (req.userid != req.params.id) {
		res.status(401).send({
			error: "You are not allowed to access this resource"
		})
	} else {
		// TODO: get user's survey designs

		next()	// goes to 404 right now
	}
}))

// Register a new user
router.post('/', handleErrors( async (req, res, next) => {
	// create new user entry in database
	const user = await User.create(req.body, UserClientFields)
	res.status(201).send({ id: user.id })
}))

// Login user
router.post('/login', handleErrors( async (req, res, next) => {
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
}))

// logout user
router.post('/logout', handleErrors( async (req, res, next) => {
	// simply get rid of the authentication token
	res.cookie("access_token", null, { httpOnly: true })
	res.status(200).send()
}))

module.exports = router;
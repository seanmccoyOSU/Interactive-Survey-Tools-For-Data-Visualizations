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
	// Get survey data from req
	const surveyData = {
		userId: req.userid,
		name: req.body.name,
	}

	// Create new survey design in database
	const surveyDesign = await SurveyDesign.create(surveyData, SurveyDesignClientFields)
	res.status(201).send({ id: surveyDesign.id })

	// next() // 404
}))



// Edit survey design
router.post('/:id', requireAuthentication, handleErrors( async (req, res, next) => {
	const surveyDesign = await getResourceById(SurveyDesign, req.params.id)

	// Check if the survey design exists
	if (!surveyDesign) {
		return res.status(404).send({ error: "Survey design not found" });
	}

	// Ensure the user is the owner of the survey design
	if (surveyDesign.userId !== req.userid) {
		return res.status(401).send({ error: "You do not have permission to edit this survey design" });
	}

	// Update the survey design's name using Sequelize update
    const [updatedCount] = await SurveyDesign.update(
        { name: req.body.name }, 
        {
            where: {
                id: req.params.id,
                userId: req.userid,
            },
        }
    );

    // Check if an update occurred
    if (updatedCount === 0) {
        return res.status(400).send({ error: "Survey design update failed, no changes made" });
    }

    // Respond with the ID of the updated survey design
    res.status(200).send({ id: surveyDesign.id });

	// next() // 404
}))



// Get specific survey design info
router.get('/:id', requireAuthentication, handleErrors( async (req, res, next) => {
	const surveyDesign = await getResourceById(SurveyDesign, req.params.id)

	if (req.userid == surveyDesign.userId) {
		res.status(200).json(surveyDesign);

	} else {
		res.status(401).send({ 
			error: "You do not have access to this resource"
		})
	}

	// next() // 404
}))

// Delete specific survey design
router.delete('/:id', requireAuthentication, handleErrors( async (req, res, next) => {
	const surveyDesign = await getResourceById(SurveyDesign, req.params.id)
	
	if (req.userid == surveyDesign.userId) {
		await surveyDesign.destroy();
		res.status(200).send()
	} else {
		res.status(401).send({ 
			error: "You do not have access to this resource"
		})
	}

	// next() // 404
}))


module.exports = router;
const express = require('express');
const { ValidationError } = require('sequelize')
const path = require('path')

const { User, UserClientFields, validateCredentials } = require('../model/User')

const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const router = express.Router();

// Register a new user
router.post('/', async (req, res, next) => {
    try {
        const user = await User.create(req.body, UserClientFields)
        res.status(201).send({ id: user.id, navTo: `users/${user.id}` })
        } catch (e) {
        if (e instanceof ValidationError) {
            res.status(400).send({ error: e.message })
        } else {
            next(e)
        }
    }
});

// Login user
router.post('/login', async (req, res, next) => {
    try {
        const authenticated = await validateCredentials(req.body.name, req.body.password)
        if (authenticated) {
          const user = await User.findOne({ where: { name: req.body.name}})
          const token = generateAuthToken(user.id)
          res.status(200).send({
            token: token,
            navTo: `users/${user.id}`
          })
        } else {
          res.status(401).send({
            error: "Invalid authentication credentials"
          })
        }
      } catch (e) {
        next(e)
      }
});

module.exports = router;
const express = require('express');
const { ValidationError } = require('sequelize')
const path = require('path')

const { User, UserClientFields, validateCredentials } = require('../model/User')

const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Register a new user
router.post('/', async (req, res, next) => {
  console.log(req.body)

  try {
      const user = await User.create(req.body, UserClientFields)
      res.status(201).redirect(req.protocol + "://" + req.get("host"))
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
        res.cookie("access_token", token, {httpOnly: true})
        res.status(200).redirect(req.protocol + "://" + req.get("host"))
      } else {
        res.status(401).send({
          error: "Invalid authentication credentials"
        })
      }
    } catch (e) {
      next(e)
    }
});

router.post('/logout', async (req, res, next) => {
  try {
    res.cookie("access_token", null, {httpOnly: true})
    res.status(200).redirect(req.protocol + "://" + req.get("host"))
  } catch (e) {
    next(e)
  }
});

module.exports = router;
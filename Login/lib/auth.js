const jwt = require("jsonwebtoken")

const secretKey = process.env.SECRET_KEY

exports.generateAuthToken = function (userId) {
  const payload = {
    sub: userId
  }
  return jwt.sign(payload, secretKey, { expiresIn: "24h" })
}

exports.requireAuthentication = function (req, res, next) {
  let token = req.cookies.access_token
  console.log(token)
  if (!token) {
    const authHeader = req.get("Authorization") || ""
    const authHeaderParts = authHeader.split(" ")
    token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
  }

  console.log(token)

  try {
    const payload = jwt.verify(token, secretKey)
    req.userid = payload.sub
    next()
  } catch (e) {
    res.status(401).send({
      error: "Valid authentication token required"
    })
  }
}

exports.checkAuthentication = function (req, res, next) {
  let token = req.cookies.access_token
  console.log(token)
  if (!token) {
    const authHeader = req.get("Authorization") || ""
    const authHeaderParts = authHeader.split(" ")
    token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
  }

  console.log(token)
  try {
    const payload = jwt.verify(token, secretKey)
    console.log(payload)
    req.userid = payload.sub
    next()
  } catch (e) {
    next()
  }
}
const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')
const crypto = require('crypto')

const PublishedSurvey = sequelize.define('publishedSurvey', {
  name: { type: DataTypes.STRING, allowNull: false, unique: false },
  openDateTime: { type: DataTypes.DATE, allowNull: true, unique: false },
  closeDateTime: { type: DataTypes.DATE, allowNull: true, unique: false },
  status: { type: DataTypes.STRING, allowNull: true, unique: false },
  linkHash: { type: DataTypes.STRING, allowNull: true, unique: false },
  surveyDesign: { type: DataTypes.JSON, allowNull: false, unique: false },
  questions: { type: DataTypes.JSON, allowNull: false, unique: false },
  results: { type: DataTypes.JSON, allowNull: true, unique: false }
}, {
  hooks: {
    beforeCreate: (publishedSurvey, options) => {
      if (Date.now() < publishedSurvey.openDateTime.valueOf()) {
        publishedSurvey.status = "pending"
      } else if (Date.now() < publishedSurvey.closeDateTime.valueOf()) {
        publishedSurvey.status = "in-progress"
      } else if (Date.now() < publishedSurvey.closeDateTime.valueOf()) {
        publishedSurvey.status = "closed"
      }

      const hash = crypto.createHash('sha1').update(String(publishedSurvey.id)).digest('hex')
      console.log("HASH", hash)
      console.log("HASH", hash.substring(0, 12))
      publishedSurvey.linkHash = hash.substring(0, 12)
    }
  }
})

exports.PublishedSurvey = PublishedSurvey

/*
 * Export an array containing the names of fields the client is allowed to set
 * on users.
 */
exports.PublishedSurveyClientFields = [
  'userId',
  'name',
  'openDateTime',
  'closeDateTime',
  'surveyDesign',
  'questions',
  'results'
]
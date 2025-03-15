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
      if (Date.now() < Date.parse(PublishedSurvey.openDateTime)) {
        publishedSurvey.status = "pending"
      } else if (Date.now() < Date.parse(PublishedSurvey.closeDateTime)) {
        publishedSurvey.status = "in-progress"
      } else if (Date.now() < Date.parse(PublishedSurvey.closeDateTime)) {
        publishedSurvey.status = "closed"
      }

      const hash = crypto.createHash('sha1').update(PublishedSurvey.id).digest('hex')
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
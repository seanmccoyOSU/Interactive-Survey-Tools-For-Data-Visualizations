const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')

const SurveyDesign = sequelize.define('surveyDesign', {
  name: { type: DataTypes.STRING, allowNull: false, unique: false },
  title: { type: DataTypes.STRING, allowNull: true, unique: false },
  introText: { type: DataTypes.TEXT, allowNull: true, unique: false },
  conclusionText: { type: DataTypes.TEXT, allowNull: true, unique: false },
}, {
  hooks: {
    beforeCreate: (surveyDesign, options) => {
      surveyDesign.title = surveyDesign.name
    }
  }
})

exports.SurveyDesign = SurveyDesign

/*
 * Export an array containing the names of fields the client is allowed to set
 * on users.
 */
exports.SurveyDesignClientFields = [
  'userId',
  'name',
  'title',
  'introText',
  'conclusionText'
]
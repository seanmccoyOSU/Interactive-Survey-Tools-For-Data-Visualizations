const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')

const SurveyDesign = sequelize.define('surveyDesign', {
  name: { type: DataTypes.STRING, allowNull: false, unique: false }
})

exports.SurveyDesign = SurveyDesign

/*
 * Export an array containing the names of fields the client is allowed to set
 * on users.
 */
exports.SurveyDesignClientFields = [
  'userId',
  'name',
]
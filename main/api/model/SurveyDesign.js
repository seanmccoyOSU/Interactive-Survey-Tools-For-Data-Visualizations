const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')
const { Question } = require('./Question');

const SurveyDesign = sequelize.define('surveyDesign', {
  survey_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  desc: {
    type: DataTypes.TEXT,
    allowNull: true,

  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'surveyDesign',
  timestamps: false
})

SurveyDesign.hasMany(Question, { foreignKey: 'survey_id' })
Question.belongsTo(SurveyDesign, { foreignKey: 'survey_id' })

exports.SurveyDesign = SurveyDesign

exports.SurveyDesignClientFields = [
  'title',
  'desc',
  'start_date',
  'end_date',
  'is_active'
]
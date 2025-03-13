const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');
const { SurveyDesign } = require('./SurveyDesign'); // or the Surveys model if named differently
const { Question } = require('./Question');
const { User } = require('./User');

const Response = sequelize.define('response', {
  response_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  survey_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  response_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'response',
  timestamps: false
});

// One Survey has many Responses:
SurveyDesign.hasMany(Response, { foreignKey: 'survey_id' });
Response.belongsTo(SurveyDesign, { foreignKey: 'survey_id' });

// One Question has many Responses:
Question.hasMany(Response, { foreignKey: 'question_id' });
Response.belongsTo(Question, { foreignKey: 'question_id' });

// One User has many Responses:
User.hasMany(Response, { foreignKey: 'user_id' });
Response.belongsTo(User, { foreignKey: 'user_id' });

exports.Response = Response;
exports.ResponseClientFields = [
  'survey_id',
  'question_id',
  'user_id',
  'response_data'
];
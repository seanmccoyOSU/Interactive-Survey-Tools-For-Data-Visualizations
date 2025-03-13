const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');
const { Visualization } = require('./Visualization');

const Question = sequelize.define('question', {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  survey_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  visual_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'question',
  timestamps: false
});

Question.belongsTo(Visualization, {
  foreignKey: {
    name: 'visual_id',
    allowNull: true
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

exports.Question = Question;

exports.QuestionClientFields = [
  'survey_id',
  'question_text',
  'question_type',
  'visual_id'
];
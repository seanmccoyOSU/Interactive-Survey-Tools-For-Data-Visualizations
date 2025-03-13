const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')

const Visualization = sequelize.define('visualization', {
  visual_id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  file_name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  file_type: { 
    type: DataTypes.STRING(50),  // matches VARCHAR(50)
    allowNull: false 
  },
  hitbox_data: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  uploaded_by: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',  // name of the referenced table
      key: 'user_id'   // the primary key in the users table
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // Disable Sequelize's automatic timestamps because we're managing created_at manually
  timestamps: false
})

exports.Visualization = Visualization

exports.VisualClientFields = [
  'file_name',
  'file_type',
  'hitbox_data',
  'uploaded_by'
  // Optionally, if clients should set these fields.
]
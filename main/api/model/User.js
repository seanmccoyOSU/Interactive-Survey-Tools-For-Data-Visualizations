const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')
const bcrypt = require('bcryptjs')
const { Visualization } = require('./Visualization')
const { SurveyDesign } = require('./SurveyDesign')

const User = sequelize.define('user', {
  user_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false,
    set(value) {
      this.setDataValue('password', bcrypt.hashSync(value, 8))
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',  // map Sequelize's createdAt to your column name
  updatedAt: false  // Disable the updatedAt column
});
/*
 * Set up associations.
 */
// One-to-many: A user can have many visualizations.
User.hasMany(Visualization, { foreignKey: 'uploaded_by' });
Visualization.belongsTo(User, { foreignKey: 'uploaded_by' });

// One-to-many: A user can have many survey designs.
User.hasMany(SurveyDesign, { foreignKey: 'created_by' })
SurveyDesign.belongsTo(User, { foreignKey: 'created_by' })

exports.User = User

exports.UserClientFields = [
  'username', // updated field name
  'email',
  'role',
  'password'
]

exports.validateCredentials = async function (username, password) {
    const user = await User.findOne({ where: { username } })
    return user && await bcrypt.compare(password, user.password)
}
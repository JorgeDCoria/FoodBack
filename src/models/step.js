const {DataTypes} = require('sequelize');
module.exports = (sequelize) =>{
  sequelize.define('step', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    number:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    step:{
      type: DataTypes.STRING,
      allowNull:false
    }
  })
}
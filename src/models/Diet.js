const {DataTypes} = require('sequelize')

module.exports = (sequalize) =>{
    sequalize.define('diet',{
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true

            }
        }
    })
}
const { Diet, Step, Op } = require('../db');

const queryRecipes = () => {
  return {
    include: [
      {
        model: Diet,
        through: {
          attributes: []
        }
      },
      {
        model: Step,
        attributes: ['number', 'step']
      }
    ]
  }

};
/**
 * generador de objeto para realizar la busqueda de recipes
 * segun la propiedad y el valor solicitado.
 * @param {String} prop nombre de la propiedad a buscar 
 * @param {Any} value valor de la propiedad a buscar
 * @returns {Object} query
 */
const queryFindRecipeByProp = (prop, value) => {
  return {
    where: {
      [prop]: value
    },
    include: [
      {
        model: Diet,
        through: {
          attributes: []
        }
      },
      {
        model: Step,
        attributes: ['number', 'step']
      }
    ]
      
     
    
  }
}

const queryFindRecipeByPropLike = (prop, value) => {
  return {
    where: {
      [prop]: { [Op.like]: `%${value}%` }
    },
    include: [
      {
        model: Diet,
        through: {
          attributes: []
        }
      },
      {
        model: Step,
        attributes: ['number', 'step']
      }
    ]


  }
}

const queryFindRecipeByDiet = (diet) => {
  return {
    include:
    {
      model: Diet,
      through: {
        attributes: []
      },
      where: {
        name: diet
      }
    },
  }
}


module.exports = {
  queryFindRecipeByProp,
  queryRecipes,
  queryFindRecipeByPropLike,
  queryFindRecipeByDiet
}
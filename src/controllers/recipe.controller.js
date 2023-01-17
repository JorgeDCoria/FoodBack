const { Recipe, Diet, Step } = require('../db');
const {
  queryRecipes
} = require('../queries/recipe.queries');

const recipeService = require('../services/recipe.service');
const axios = require('axios');
const URL = 'http://localhost:3002/api/'
const recipeCtrl = {};


recipeCtrl.getRecipes = async (req, res) => {
  try {
    if (req.query.title) {
      const allRecipes = await recipeService.getRecipesByNameOpLike(req.query.title);
      //hay coincidencias
      if(allRecipes.length) return res.json({status:'Ok', data: allRecipes});
      //Sin coincidencias
      else throw ({status: 400, message: `Not found recipe with name ${req.query.title}`});
      
    } else {
      const recipes = await recipeService.findAllRecipes();
      res.json(recipes);
    }

  } catch (e) {
    res.status(e?.status || 500).json({message: e?.message || e.message })
  }
}

recipeCtrl.getRecipeById = (req, res) => {
  recipeService.getRecipeById(req.params.id)
    .then(r => res.json({status: 'OK', data:r}))
    .catch(e => res.status(e?.status || 500).json({ status: 'FAILED' , data: `Error: ${e.message}` }));
 
}

recipeCtrl.addRecipe = async (req, res) => {
  const recipes  = req.body;
  try {
    //array de promesas para crear recipes
    let mapAux = recipes.map(r => Recipe.create({ title: r.title, image:r.image, summary: r.summary, healthScore: parseInt(r.healthScore)}));
    const result = await Promise.all(mapAux);

    for (let i = 0; i < recipes.length; i++) {
      if (recipes[i].steps.length) {
        //array de promesas para crear cada step
        let stepsAux = recipes[i].steps.map(r => Step.create(r));
        //se corren las promesa
        stepsAux = await Promise.all(stepsAux);
        //array de promesas para agregar un recipe a un step
        stepsAux = stepsAux.map(r => r.setRecipe(result[i].id));
        await Promise.all(stepsAux);
      }
    }
    //const stepResult = await Promise.all(stepsAux);

    mapAux = [];
    let dietsBd = recipes.map(e =>Diet.findAll({where:{name:e.diets}}));
    dietsBd = await Promise.all(dietsBd);
    console.log(JSON.stringify(dietsBd));
    
    //se arma array de promesas para agregar las dietas a las recetas
    for (let i = 0; i < recipes.length; i++) {
      mapAux.push(result[i].addDiets(dietsBd[i]))
    }
    await Promise.all(mapAux);
    const recipesBd = await Recipe.findAll(queryRecipes());
    res.json(recipesBd);
  } catch (e) {
    res.status(401).json({ error: `error saving recipe: ${e.message}` })
  }
}

recipeCtrl.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    recipe && await recipe.update({
      title: req.body.title,
      healthScore: req.body.healthScore,
      summary: req.body.summary
    })

    await recipe.setDiets(req.body.diets)
    await recipe.save();
    res.json(recipe);

  } catch (e) {
    res.status(401).json({ error: `error updating recipe: ${e.message}` });
  }
}
recipeCtrl.deleteRecipe = async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id);
  await recipe.destroy();
  res.json("Recipes dropped");

}

recipeCtrl.findRecipeByDiet = async (req, res) => {
  const recipeBd = await recipeService.findRecipeByDiet(req.query.name);
  res.json(recipeBd);
}

recipeCtrl.findRecipeByTitle = async (req, res) =>{
  try{
    const recipe = await recipeService.findRecipeByTitle(req.query.title);
    if(recipe) return res.json({status:'OK', data: recipe});
    res.json({status:'FAILED', data:''});
  }catch(e){
    res.status(400).json({message: e.message})
  }
  
}
module.exports = recipeCtrl;
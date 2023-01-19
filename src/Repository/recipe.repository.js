const {Recipe, conn} = require('../db');
const {QueryTypes} = require('sequelize');
const {
  queryFindRecipeByProp,
  queryFindRecipeByPropLike,
  queryRecipes
} = require('../queries/recipe.queries')
const findRecipeByDiet = async (diet)=>{
  //const recipe = await 
}

const findRecipesIdByDiet = async (dietId) =>{
 const recipesId = await conn.query(`SELECT "recipeId" FROM recipes_diets WHERE "dietId"='${dietId}'`, {type: conn.QueryTypes.SELECT});
  return recipesId;
}

const findRecipesByIds = async (arrayRecipesId)=>{
  let aux = arrayRecipesId.map(e => Recipe.findOne(queryFindRecipeByProp("id", e.recipeId) ));
  console.log(JSON.stringify(aux));
  const recipes = await Promise.all(aux);
  return recipes;
}
const findRecipeByNameOpLike = async (name) =>{
  return await Recipe.findAll(queryFindRecipeByPropLike('title', name));
}

const findAllRecipes = async ()=> {
  return await Recipe.findAll(queryRecipes());
}

const findRecipeById = async (id) =>{
  try{
    const recipe = await Recipe.findOne(queryFindRecipeByProp('id', id));
    if(recipe) return recipe;
    throw({status: 400, message: `Not Found Recipe with Id ${id}`});
  }catch (e){
    throw({status: e?.status || 500, message: e.message });
  }
}

const findRecipeByTitle = async (title) =>{
  try{
    const recipe = await Recipe.findOne(queryFindRecipeByProp('title', title));
    return recipe;
    
  }catch (e){
    throw({status: e?.status || 500, message: e.message });
  }
}

const addRecipe = async (recipe) =>{
  try{
    const recipe = await Recipe.create(recipe);
    return recipe;
  }catch(e){
    throw ({status: e?.status || 500, message: e.message});
  }
}
module.exports = {
  findRecipeByDiet,
  findRecipesIdByDiet,
  findRecipesByIds,
  findRecipeByNameOpLike,
  findAllRecipes, 
  findRecipeById,
  findRecipeByTitle,
  addRecipe
}
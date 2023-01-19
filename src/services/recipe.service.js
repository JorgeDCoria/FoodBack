const recipeRepository = require("../Repository/recipe.repository");
const dietRepository = require("../Repository/diet.repository");
const axios = require("axios");

const APIKEY = "09192bc3cbe64830bf3e527e38a4943c";
const URL = "http://localhost:3002/api/";
const URLTWO = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${APIKEY}&addRecipeInformation=true&number=100`;
const URLTHREE = (id) =>
  `https://api.spoonacular.com/recipes/${id}/information?apiKey=${APIKEY}`;

//########## mapeo de datos de bd   ##########
const mapArrayBdToArrayRecipe = (data) => {
  return data.map((e) => mapRecipeBdToRecipe(e));
};
const mapRecipeBdToRecipe = (recipe) => {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    summary: recipe.summary,
    healthScore: recipe.healthScore,
    diets: recipe.diets.map((e) => e.name),
    steps: recipe.steps, //.map(e => {return {numer: e.number, step: e.step}})
  };
};
//########## mapeo de recipes de api ########################
const mapArrayApiToArrayRecipe = (arrayApi) => {
  return arrayApi.map((recipe) => mapApiToRecipe(recipe));
};

const mapApiToRecipe = (recipe) => {
  // dietas

  let dietsApi = new Set();
  recipe.vegetarian && dietsApi.add("vegetarian");
  recipe.vegan && dietsApi.add("vegan");
  recipe.glutenFree && dietsApi.add("gluten free");
  //se hace recorrido en diets para agregar solo aquellos que no pertenecen a dietsApi
  if (recipe.diets.length) {
    for (let diet of recipe.diets) {
      dietsApi.add(diet);
    }
  }
  //paso a paso
  let stepsApi = [];

  if (recipe.analyzedInstructions.length) {
    for (let obj of recipe.analyzedInstructions) {
      stepsApi = [
        ...stepsApi,
        ...obj.steps.map((s) => {
          return { number: s.number, step: s.step };
        }),
      ];
    }
  }

  return {
    id: recipe.id,
    title: recipe.title,
    healthScore: recipe.healthScore,
    image: recipe.image,
    summary: recipe.summary,
    diets: Array.from(dietsApi),
    steps: stepsApi,
  };
};

const findRecipeByDiet = async (diet) => {
  const dietId = await dietRepository.findDietByName(diet);
  const recipesId = await recipeRepository.findRecipesIdByDiet(dietId.id);
  let recipesBd = await recipeRepository
    .findRecipesByIds(recipesId)
    .then((r) => mapArrayBdToArrayRecipe(r));
  let recipesApi = await axios
    .get(`${URL}allRecipes`)
    .then((r) => r.data.results)
    .then((r) =>
      mapArrayApiToArrayRecipe(r.filter((r) => r.diets.includes(diet)))
    );
  return [...recipesApi, ...recipesBd];
};

const getRecipesByNameOpLike = async (name) => {
  let recipesBd = await recipeRepository
    .findRecipeByNameOpLike(name)
    .then((r) => mapArrayBdToArrayRecipe(r));
  let recipesApi = await axios
    .get(URLTWO)
    .then((r) => r.data.results)
    .then((r) =>
      mapArrayApiToArrayRecipe(r.filter((r) => r.title.includes(name)))
    );

  return [...recipesApi, ...recipesBd];
};

const findAllRecipes = async () => {
  const recipesBd = await recipeRepository
    .findAllRecipes()
    .then((r) => mapArrayBdToArrayRecipe(r));
  const recipesApi = await axios
    .get(`${URLTWO}allRecipes`)
    .then((r) => mapArrayApiToArrayRecipe(r.data.results));
  return [...recipesApi, ...recipesBd];
};

const getRecipeById = async (id) => {
  let recipe;
  try {
    if (isNaN(id)) {
      recipe = await recipeRepository
        .findRecipeById(id)
        .then((r) => mapRecipeBdToRecipe(r));
    } else {
      recipe = await axios.get(URLTHREE(id)).then((r) => r.data);
      if (recipe) recipe = mapApiToRecipe(recipe);
      else throw { status: 400, message: `Not found Recipe with Id ${id}` };
    }
    return recipe;
  } catch (e) {
    throw { status: e?.status || 500, message: e.message };
  }
};

const findRecipeByTitle = async (title) => {
  let recipe = await recipeRepository.findRecipeByTitle(title);
  if (recipe) recipe = mapRecipeBdToRecipe(recipe);
  return recipe;
};
module.exports = {
  findRecipeByDiet,
  getRecipesByNameOpLike,
  findAllRecipes,
  getRecipeById,
  findRecipeByTitle,
};

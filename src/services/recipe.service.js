const recipeRepository = require("../Repository/recipe.repository");
const dietRepository = require("../Repository/diet.repository");
const axios = require("axios");

const APIKEY = "09192bc3cbe64830bf3e527e38a4943c";
const URL = "http://localhost:3002/api/";
const URLTWO = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${APIKEY}&addRecipeInformation=true&number=100`;
const URLTHREE = `https://api.spoonacular.com/recipes/{id}/information?apiKey=${APIKEY}`;

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
const addRecipes = async (recipes) => {
  //se arma un array de promesas para luego agregarlas en paralelo.
  let mapAux = recipes.map((r) =>
    recipeRepository.addRecipe({
      title: r.title,
      image: r.image,
      summary: r.summary,
      healthScore: parseInt(r.healthScore),
    })
  );
  //array con recipes ya agregadas en la bd
  const result = await Promise.all(mapAux);

  //registrar steps
  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i].steps.length) {
      //array de promesas para crear cada step
      let stepsAux = recipes[i].steps.map((r) => Step.create(r));
      //se corren las promesa
      stepsAux = await Promise.all(stepsAux);
      //array de promesas para agregar un recipe a un step
      stepsAux = stepsAux.map((r) => r.setRecipe(result[i].id));
      await Promise.all(stepsAux);
    }
  }
  //const stepResult = await Promise.all(stepsAux);

  mapAux = [];
  let dietsBd = recipes.map((e) => Diet.findAll({ where: { name: e.diets } }));
  dietsBd = await Promise.all(dietsBd);
  console.log(JSON.stringify(dietsBd));

  //se arma array de promesas para agregar las dietas a las recetas
  for (let i = 0; i < recipes.length; i++) {
    mapAux.push(result[i].addDiets(dietsBd[i]));
  }
  await Promise.all(mapAux);
  const recipesBd = await Recipe.findAll(queryRecipes());
};
const findOrCreateRecipes = async () => {
  const recipes = await axios
    .get(URLTWO)
    .then((res) => mapArrayApiToArrayRecipe(res.data.results));
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
    .get(`${URL}allRecipes`)
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
    .get(`${URL}allRecipes`)
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
      recipe = await axios.get(`${URL}byId`).then((r) => r.data);
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
  addRecipes,
  findOrCreateRecipes,
};

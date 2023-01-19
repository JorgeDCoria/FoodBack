const { Step } = require("../db");

const addStepOnRecipe = async (steps, recipeId) => {
  try {
    let stepsAux = steps.map((r) => Step.create(r));
    //se corren las promesa
    stepsAux = await Promise.all(stepsAux);
    //array de promesas para agregar un recipe a un step
    stepsAux = stepsAux.map((r) => r.setRecipe(recipeId));
    await Promise.all(stepsAux);
  } catch (e) {}
};

module.exports = {
  addStepOnRecipe,
};

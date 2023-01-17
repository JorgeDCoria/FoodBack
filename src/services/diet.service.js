const URI = "http://localhost:3002/api/allRecipes";
const axios = require('axios');
const dietRepository = require('../Repository/diet.repository');

const mapArrayApiToDiets = (recipes) =>{
  let diets = new Set();
  for (const r of recipes) {
    for (const d of r.diets) {
      diets.add(d);
    }
  }
  return Array.from(diets).map(d =>{return{name:d}});
}
const getAllDietsFromBd = async () =>{
  try{
    const diets = await dietRepository.getAllDiets();
    if(!diets.length) throw {status:400, message: "Not Found Diets in BD"}
    return diets;
  }catch (e){
    throw{ status: e?.status || 500, message: e?.message || e.message}
  }
}

const findOrCreateDiets = async ()=>{
  try{
    let diets = await dietRepository.getAllDiets();
    if(!diets.length){
      diets = await getALLDietsFromApi();
      await dietRepository.addDiets(diets);
      console.log("successfully added diets")
    }else{
      console.log("Diets exist in the Data Base")
    }
  }catch(e){
    throw{status: e?.status || 500, message: e?.message || e.message};
  }
  

}

const getALLDietsFromApi = async () =>{
  try{
    const diets = await axios.get(URI).then(r => mapArrayApiToDiets(r.data.results));
    return diets;
  }catch(e){
  throw{status: e?.status || 500, message: `Error loading diets ${e.message}`}
  }
}

module.exports = {
  getALLDietsFromApi,
  findOrCreateDiets,
  getAllDietsFromBd
}
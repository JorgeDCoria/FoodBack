const {Diet} = require('../db.js');
const dietService = require('../services/diet.service')

const dietCtrl = {};

const getAllDietbd = async () =>{
  return await Diet.findAll();
}

dietCtrl.getDiets = async (req, res)=>{
  try{
    const diets = await dietService.getAllDietsFromBd();
    res.json({status: 'OK', data: diets});
  }catch(e){
    res.status(e?.status || 500).json({status:'FAILDED', data: e.message})
  }
  
}

dietCtrl.createDiet = async (req, res) =>{
  const {name} = req.body;
  try{
    const newDiet = await Diet.create({name});
    res.json(newDiet);
  }catch (e){
    res.status(401).json({error: "Failed to save diet. razon: "+e.message});
  }


}

module.exports = dietCtrl;
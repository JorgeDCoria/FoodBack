const {Router} = require('express');
const dietCtrl = require('../controllers/diet.controller');
const router = Router();

router.get("/", dietCtrl.getDiets);
router.post("/", dietCtrl.createDiet);
module.exports = router;
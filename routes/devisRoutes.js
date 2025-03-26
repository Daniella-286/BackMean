const express = require("express");
const { getDevisDetailsController } = require("../controllers/devisController");

const router = express.Router();

router.get("/details/:id_demande", getDevisDetailsController);

module.exports = router;

const express = require('express');
const { createSeuilStock, getAllSeuilStocks, getSeuilStockById, updateSeuilStock, deleteSeuilStock } = require('../controllers/seuilStockController');

const router = express.Router();

router.post('/', createSeuilStock);
router.get('/', getAllSeuilStocks);
router.get('/:id', getSeuilStockById);
router.put('/:id', updateSeuilStock);
router.delete('/:id', deleteSeuilStock);

module.exports = router;

const express = require('express');
const { createDeadline, getAllDeadlines, getDeadlineById, updateDeadline, deleteDeadline } = require('../controllers/deadlineController');

const router = express.Router();

router.post('/', createDeadline);
router.get('/', getAllDeadlines);
router.get('/:id', getDeadlineById);
router.put('/:id', updateDeadline);
router.delete('/:id', deleteDeadline);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate
} = require('../controllers/candidateController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCandidates)
    .post(protect, admin, addCandidate);

router.route('/:id')
    .put(protect, admin, updateCandidate)
    .delete(protect, admin, deleteCandidate);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getElections,
    createElection,
    updateElectionStatus,
    deleteElection,
    getElectionResults,
    updateElection
} = require('../controllers/electionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getElections)
    .post(protect, admin, createElection);

router.route('/:id/status')
    .patch(protect, admin, updateElectionStatus);

router.route('/:id')
    .put(protect, admin, updateElection)
    .delete(protect, admin, deleteElection);

router.route('/:id/results')
    .get(protect, getElectionResults); // Everyone can see results? Or just admin/after publish?

module.exports = router;

const express = require('express');
const router = express.Router();
const { castVote, getVoteStatus, getMyVoteHistory } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, castVote);
router.get('/status', protect, getVoteStatus);
router.get('/history', protect, getMyVoteHistory);

module.exports = router;

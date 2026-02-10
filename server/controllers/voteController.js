const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private
const castVote = async (req, res) => {
    const { electionId, candidateId } = req.body;
    const voterId = req.user._id;

    try {
        // Check if election exists and is active
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }
        if (election.status !== 'active') {
            return res.status(400).json({ message: 'Election is not active' });
        }

        // Check if user has already voted
        const existingVote = await Vote.findOne({ voterId, electionId });
        if (existingVote) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // Cast vote
        const vote = new Vote({
            voterId,
            electionId,
            candidateId
        });

        await vote.save();
        res.status(201).json({ message: 'Vote cast successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get voting status for a user in an election
// @route   GET /api/votes/status
// @access  Private
const getVoteStatus = async (req, res) => {
    const { electionId } = req.query;
    const voterId = req.user._id;

    try {
        const vote = await Vote.findOne({ voterId, electionId });
        res.json({ hasVoted: !!vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all votes by the current user
// @route   GET /api/votes/history
// @access  Private
const getMyVoteHistory = async (req, res) => {
    const voterId = req.user._id;
    try {
        const votes = await Vote.find({ voterId }).select('electionId');
        // Return array of electionIds
        res.json(votes.map(v => v.electionId));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { castVote, getVoteStatus, getMyVoteHistory };

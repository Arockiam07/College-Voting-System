const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalVotes = await Vote.countDocuments();
        const totalElections = await Election.countDocuments();
        const totalCandidates = await Candidate.countDocuments();

        const activeElections = await Election.countDocuments({ status: 'active' });
        const upcomingElections = await Election.countDocuments({ status: 'upcoming' });
        const closedElections = await Election.countDocuments({ status: 'closed' });

        // Aggregate votes per election
        const votesAggregation = await Vote.aggregate([
            { $group: { _id: "$electionId", count: { $sum: 1 } } }
        ]);

        // Aggregate candidates per election
        const candidatesAggregation = await Candidate.aggregate([
            { $group: { _id: "$electionId", count: { $sum: 1 } } }
        ]);

        // Populate names for charts
        const elections = await Election.find({}, 'name _id');

        const votesPerElection = elections.map(e => {
            const voteData = votesAggregation.find(v => v._id.toString() === e._id.toString());
            return { name: e.name, votes: voteData ? voteData.count : 0 };
        });

        const candidatesPerElection = elections.map(e => {
            const candData = candidatesAggregation.find(c => c._id.toString() === e._id.toString());
            return { name: e.name, candidates: candData ? candData.count : 0 };
        });

        res.json({
            totalVotes,
            totalElections,
            totalCandidates,
            activeElections,
            upcomingElections,
            closedElections,
            votesPerElection,
            candidatesPerElection
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats };

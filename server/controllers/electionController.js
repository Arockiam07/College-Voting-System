const Election = require('../models/Election');

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public (or Protected based on requirements)
const getElections = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Vote = require('../models/Vote');
        const Candidate = require('../models/Candidate');

        const elections = await Election.find({}).lean();

        // Get counts for each election
        const electionIds = elections.map(e => e._id);

        const voteCounts = await Vote.aggregate([
            { $match: { electionId: { $in: electionIds } } },
            { $group: { _id: "$electionId", count: { $sum: 1 } } }
        ]);

        const candidateCounts = await Candidate.aggregate([
            { $match: { electionId: { $in: electionIds } } },
            { $group: { _id: "$electionId", count: { $sum: 1 } } }
        ]);

        const electionsWithCounts = elections.map(election => {
            const vCount = voteCounts.find(v => v._id.toString() === election._id.toString());
            const cCount = candidateCounts.find(c => c._id.toString() === election._id.toString());

            return {
                ...election,
                totalVotes: vCount ? vCount.count : 0,
                candidateCount: cCount ? cCount.count : 0
            };
        });

        res.json(electionsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new election
// @route   POST /api/elections
// @access  Private/Admin
const createElection = async (req, res) => {
    const { name, description, startDate, endDate } = req.body;

    try {
        const election = new Election({
            name,
            description,
            startDate,
            endDate,
            status: "upcoming"
        });

        const createdElection = await Election.create(election);
        console.log("Created Election with status:", createdElection.status);
        res.status(201).json(createdElection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update election status
// @route   PATCH /api/elections/:id/status
// @access  Private/Admin
const updateElectionStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const election = await Election.findById(req.params.id);

        if (election) {
            election.status = status;
            if (status === 'closed') {
                election.resultsPublished = true;
            }
            const updatedElection = await election.save();
            res.json(updatedElection);
        } else {
            res.status(404).json({ message: 'Election not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
const deleteElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (election) {
            await election.deleteOne();
            res.json({ message: 'Election removed' });
        } else {
            res.status(404).json({ message: 'Election not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get election results (placeholder for now)
// @route   GET /api/elections/:id/results
// @access  Private
const getElectionResults = async (req, res) => {
    try {
        const electionId = req.params.id;
        const mongoose = require('mongoose');
        const Vote = require('../models/Vote');
        const Candidate = require('../models/Candidate');
        const Election = require('../models/Election');

        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        // Aggregate votes for this election
        const results = await Vote.aggregate([
            { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
            { $group: { _id: "$candidateId", votes: { $sum: 1 } } }
        ]);

        // Get all candidates for this election to include 0-vote candidates
        const candidates = await Candidate.find({ electionId });

        // Map results to candidates
        const formattedResults = candidates.map(candidate => {
            const voteData = results.find(r => r._id.toString() === candidate._id.toString());
            return {
                candidateId: candidate._id,
                name: candidate.name,
                department: candidate.department,
                votes: voteData ? voteData.votes : 0
            };
        });

        res.json({
            election: election,
            results: formattedResults
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update election details
// @route   PUT /api/elections/:id
// @access  Private/Admin
const updateElection = async (req, res) => {
    const { name, description, startDate, endDate } = req.body;
    console.log("Updating election:", req.params.id, req.body);

    try {
        const election = await Election.findById(req.params.id);

        if (election) {
            election.name = name !== undefined ? name : election.name;
            election.description = description !== undefined ? description : election.description;
            election.startDate = startDate !== undefined ? startDate : election.startDate;
            election.endDate = endDate !== undefined ? endDate : election.endDate;

            const updatedElection = await election.save();
            console.log("Election updated:", updatedElection);
            res.json(updatedElection);
        } else {
            res.status(404).json({ message: 'Election not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getElections,
    createElection,
    updateElectionStatus,
    deleteElection,
    getElectionResults,
    updateElection
};

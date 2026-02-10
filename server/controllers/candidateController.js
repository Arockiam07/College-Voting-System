const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Get candidates for an election
// @route   GET /api/candidates
// @access  Public (or Protected)
const getCandidates = async (req, res) => {
    const electionId = req.query.electionId;

    try {
        let query = {};
        if (electionId) {
            query.electionId = electionId;
        }
        const candidates = await Candidate.find(query);
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a candidate
// @route   POST /api/candidates
// @access  Private/Admin
const addCandidate = async (req, res) => {
    const { name, department, year, photo, electionId } = req.body;

    try {
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const candidate = new Candidate({
            name,
            department,
            year,
            photo,
            electionId
        });

        const createdCandidate = await candidate.save();
        res.status(201).json(createdCandidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
const updateCandidate = async (req, res) => {
    const { name, department, year, photo, electionId } = req.body;
    console.log("Updating candidate:", req.params.id, req.body);

    try {
        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            candidate.name = name !== undefined ? name : candidate.name;
            candidate.department = department !== undefined ? department : candidate.department;
            candidate.year = year !== undefined ? year : candidate.year;
            candidate.photo = photo !== undefined ? photo : candidate.photo;
            candidate.electionId = electionId !== undefined ? electionId : candidate.electionId;

            const updatedCandidate = await candidate.save();
            console.log("Candidate updated:", updatedCandidate);
            res.json(updatedCandidate);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            await candidate.deleteOne();
            res.json({ message: 'Candidate removed' });
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate
};

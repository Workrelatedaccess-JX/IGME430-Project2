const models = require('../models');

const { Suggestion } = models;

// Render the main app page, which React fills in on the client
const feedPage = (req, res) => res.render('app', { username: req.session.account.username});

// Return every suggestion (public feed), newest first, with the author's username
const getSuggestions = async (req, res) => {
    try {
        const docs = await Suggestion.find({})
        .sort({ createdDate: -1 })
        .populate('owner', 'username')
        .lean()
        .exec();
        return res.json({ suggestions: docs.map(Suggestion.toAPI) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving suggestions!' });
    }
};

// Return only the suggestions that belong to the logged-in account
const getMySuggestions = async (req, res) => {
    try {
        const docs = await Suggestion.find({ owner: req.session.account._id })
        .sort({ createdDate: -1 })
        .lean()
        .exec();
        return res.json({ suggestions: docs.map(Suggestion.toAPI) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving your suggestions!' });
    }
};

// Create a suggestion; the owner always comes from the session, never from the request body
const makeSuggestion = async (req, res) => {
    const {
        title, description, category, location,
    } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description, and category are required!' });
    }

    if (!Suggestion.categories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category!' });
    }

    try {
        const newSuggestion = new Suggestion({
            title,
            description,
            category,
            location,
            owner: req.session.account._id,
        });
        await newSuggestion.save();

        const result = Suggestion.toAPI(newSuggestion);
        result.ownerName = req.session.account.username;
        return res.status(201).json(result);
    } catch (err) {
        console.log(err);
        // Schema validation failures (too long, etc.) are the client's fault
        if (err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Suggestion is invalid or too long!' });
        }
        return res.status(500).json({ error: 'An error occurred submitting the suggestion!' });
    }
};

module.exports = {
    feedPage,
    getSuggestions,
    getMySuggestions,
    makeSuggestion,
};
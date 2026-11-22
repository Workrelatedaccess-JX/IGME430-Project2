const mongoose = require('mongoose');

// Clean up text before saving it to the database
const cleanText = (text) => text.trim();

// Define the data structure for a campus suggestion
const SuggestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        set: cleanText,
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
        set: cleanText,
    },

    category: {
        type: String,
        required: true,
        enum: [
            'Buildings',
            'Facilities',
            'Campus Environment',
            'Accessibility',
            'Student Experience',
            'Other',
        ],
    },

    location: {
        type: String,
        trim: true,
        maxlength: 100,
        default: '',
        set: cleanText,
    },

    // Connect this suggestion to the account that created it
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },

    createdDate: {
        type: Date,
        default: Date.now,
    },
});

// Convert a suggestion document to an API-friendly format, including the owner's username if available
SuggestionSchema.statics.toAPI = (doc) => ({
    _id: doc._id,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    location: doc.location,
    createdDate: doc.createdDate,
    ownerName: doc.owner && doc.owner.username ? doc.owner.username : undefined,
});

// Expose the allowed categories so the controller and client share one list
SuggestionSchema.statics.categories = SuggestionSchema.path('category').enumValues;

const SuggestionModel = mongoose.model('Suggestion', SuggestionSchema);

module.exports = SuggestionModel;
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// App.jsx is the main React component for the app page, 
// which includes the suggestion form, category filter, and suggestion list. 
// It manages state for the current view (people's suggestions or user's suggestions), selected category, and a reload key to trigger reloading suggestions when a new suggestion is added.

// Categories a suggestion can belong to (must match the enum in the Suggestion model)
const CATEGORIES = [
    'Buildings',
    'Facilities',
    'Campus Environment',
    'Accessibility',
    'Student Experience',
    'Other',
];

// Form for submitting a new suggestion; the server assigns the owner from the session
const SuggestionForm = ({ onSuggestionAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');

    // Validate, send the POST, and clear the form only if the server accepted it
    const handleSubmit = (e) => {
        e.preventDefault();
        helper.hideError();

        if (!title.trim() || !description.trim() || !category) {
            helper.handleError('Title, description, and category are required');
            return;
        }

        helper.sendPost('/suggestions', { title, description, category, location }, (result) => {
            if (result.error) {
                return;
            }
            setTitle('');
            setDescription('');
            setCategory('');
            setLocation('');
            onSuggestionAdded();
        });
    };

    return (
        <form id="suggestionForm" className="suggestionForm" onSubmit={handleSubmit}>
            <h2>Share an idea you have on RIT Campus</h2>
            <label htmlFor="title">Title</label>
            <input
                id="title"
                type="text"
                maxLength="100"
                placeholder="Short summary of your idea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="description">Description</label>
            <textarea
                id="description"
                maxLength="1000"
                rows="4"
                placeholder="Where and what would you like to see improved, and why?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div className="formRow">
                <div>
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Choose a category</option>
                        {CATEGORIES.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="location">Location (optional)</label>
                    <input
                        id="location"
                        type="text"
                        maxLength="100"
                        placeholder="e.g. Gleason Library"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </div>

            <input className="primaryButton" type="submit" value="Submit suggestion" />
        </form>
    );
};

// Dropdown that narrows the visible suggestions to one category
const CategoryFilter = ({ selected, onChange }) => (
    <div className="categoryFilter">
        <label htmlFor="categoryFilter">Filter by category</label>
        <select
            id="categoryFilter"
            value={selected}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">All categories</option>
            {CATEGORIES.map((name) => (
                <option key={name} value={name}>{name}</option>
            ))}
        </select>
    </div>
);

// One suggestion shown as a card; the author line only appears when the server sent it
const SuggestionCard = ({ suggestion }) => (
    <article className="suggestionCard">
        <span className="categoryTag">{suggestion.category}</span>
        <h3>{suggestion.title}</h3>
        <p>{suggestion.description}</p>
        <footer>
            {suggestion.location && <span>{suggestion.location}</span>}
            {suggestion.ownerName && <span>by {suggestion.ownerName}</span>}
            <span>{new Date(suggestion.createdDate).toLocaleDateString()}</span>
        </footer>
    </article>
);

// Loads suggestions from the given endpoint and renders them as cards.
// Used for both the public feed and My Suggestions; reloads when endpoint or reloadKey changes.
const SuggestionList = ({ endpoint, reloadKey, category, emptyMessage }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSuggestions = async () => {
            setLoading(true);
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                if (!response.ok) {
                    helper.handleError(data.error);
                    return;
                }
                setSuggestions(data.suggestions);
            } catch (err) {
                helper.handleError('Unable to load suggestions');
            } finally {
                setLoading(false);
            }
        };
        loadSuggestions();
    }, [endpoint, reloadKey]);

    if (loading) {
        return <p className="emptyMessage">Loading...</p>;
    }

    const visible = category
        ? suggestions.filter((s) => s.category === category)
        : suggestions;

    if (visible.length === 0) {
        return <p className="emptyMessage">{emptyMessage}</p>;
    }

    return (
        <div className="suggestionList">
            {visible.map((s) => <SuggestionCard key={s._id} suggestion={s} />)}
        </div>
    );
};

// Main app: the form on top, then tabs that switch between the public feed and My Suggestions
const App = () => {
    const [view, setView] = useState('all');
    const [category, setCategory] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    const showingAll = view === 'all';

    return (
        <div>
            <SuggestionForm onSuggestionAdded={() => setReloadKey(reloadKey + 1)} />

            <div className="tabs">
                <button
                    type="button"
                    className={showingAll ? 'tab active' : 'tab'}
                    onClick={() => setView('all')}
                >
                    People's suggestions
                </button>
                <button
                    type="button"
                    className={showingAll ? 'tab' : 'tab active'}
                    onClick={() => setView('mine')}
                >
                    My suggestions
                </button>
            </div>

            <CategoryFilter selected={category} onChange={setCategory} />

            <SuggestionList
                endpoint={showingAll ? '/suggestions' : '/mySuggestions'}
                reloadKey={reloadKey}
                category={category}
                emptyMessage={showingAll
                    ? 'No suggestions yet. Be the first to share one!'
                    : 'You have not submitted any suggestions yet.'}
            />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
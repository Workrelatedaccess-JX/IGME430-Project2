const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    // Login page and login submission
    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

    // Signup submission
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    // Logout, then redirect to the login page
    app.get('/logout', mid.requiresLogin, controllers.Account.logout);

    // Main app page (React renders the feed, form, and My Suggestions views)
    app.get('/feed', mid.requiresLogin, controllers.Suggestion.feedPage);

    // Public feed of all suggestions
    app.get('/suggestions', mid.requiresLogin, controllers.Suggestion.getSuggestions);

    // Submit a new suggestion (owner is set from the session)
    app.post('/suggestions', mid.requiresLogin, controllers.Suggestion.makeSuggestion);

    // Only the logged-in user's suggestions
    app.get('/mySuggestions', mid.requiresLogin, controllers.Suggestion.getMySuggestions);

    // Landing page
    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
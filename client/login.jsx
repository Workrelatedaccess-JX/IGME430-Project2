const helper = require('./helper.js');
const React = require('react');
const { useState } = React;
const { createRoot } = require('react-dom/client');

// login form logic
// start with preventDefault to stop the default form submission behavior,
// stop the page from reloading,
// so custom logic will handle the form submission
const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    // with default prevented, get the username and password values from the form inputs
    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });
    return false;
};

// signup form logic
// same with handleLogin, 
// with the difference being additional values being retrieved from the form inputs, 
// and additional validation for password matching
const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });

    return false;
};

// A new addition to the login page,
// this component renders the RIT Voice logo at the top of the login and signup forms
const Logo = () => (
    <div className="logo">
        <span className="logoRit">RIT</span>
        <span className="logoDivider"></span>
        <span className="logoVoice">Voice</span>
    </div>
);

// login form format in the login page, 
// now changed to a React component, 
// with username and password input fields and a submit button
const LoginWindow = ({ onSwitch }) => (
    <form id="loginForm"
        name="loginForm"
        onSubmit={handleLogin}
        action="/login"
        method="POST"
        className="authForm"
    >
        <h1>Log In</h1>
        <p className="authSubtitle">Share and browse ideas to improve campus</p>
        <input id="user" type="text" name="username" placeholder="Username" aria-label="Username" />
        <input id="pass" type="password" name="pass" placeholder="Password" aria-label="Password" />
        <input className="formSubmit" type="submit" value="Log In" />
        <p className="authSwitch">
            Need an account?{' '}
            <button type="button" className="linkButton" onClick={onSwitch}>Sign up</button>
        </p>
    </form>
);

// signup form format in the signup page,
// now changed to a React component,
// with username, password, and password confirmation input fields and a submit button
const SignupWindow = ({ onSwitch }) => (
    <form id="signupForm"
        name="signupForm"
        onSubmit={handleSignup}
        action="/signup"
        method="POST"
        className="authForm"
    >
        <h1>Create Account</h1>
        <p className="authSubtitle">Join RIT Voice to share your ideas</p>
        <input id="user" type="text" name="username" placeholder="Username" aria-label="Username" />
        <input id="pass" type="password" name="pass" placeholder="Password" aria-label="Password" />
        <input id="pass2" type="password" name="pass2" placeholder="Retype password" aria-label="Retype password" />
        <input className="formSubmit" type="submit" value="Sign Up" />
        <p className="authSwitch">
            Already have an account?{' '}
            <button type="button" className="linkButton" onClick={onSwitch}>Log in</button>
        </p>
    </form>
);

// With login and signup forms change to react components, 
// this function is used to render the logo in the login and signup pages,
// and switch between the login and signup forms when the user clicks the switch button.
const AuthPage = () => {
    const [mode, setMode] = useState('login');

    // Swap forms and clear any leftover error message
    const switchMode = (nextMode) => {
        helper.hideError();
        setMode(nextMode);
    };

    return (
        <div className="authPage">
            <div className="authCard">
                <Logo />
                {mode === 'login'
                    ? <LoginWindow onSwitch={() => switchMode('signup')} />
                    : <SignupWindow onSwitch={() => switchMode('login')} />}
            </div>
        </div>
    );
};

// Initialize the page by rendering the login form and setting up event listeners for the login and signup buttons
const init = () => {
    const root = createRoot(document.getElementById('content'));
    root.render(<AuthPage />);
};

window.onload = init;
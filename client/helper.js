// Display error message display the message on the webpage
// and make the error box visible so the user can read it
const handleError = (message) => {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorBox').classList.remove('hidden');
};

// Send a POST request with JSON data, then redirect, show an error, or call the handler
const sendPost = async (url, data, handler) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // wait for the response and parse it as JSON
        const result = await response.json();
        hideError();

        // A redirect means success (login/signup), an error means show the message,
        // and the optional handler lets the caller react to the result
        if (result.redirect) {
            window.location = result.redirect;
        }
        if (result.error) {
            handleError(result.error);
        }
        if (handler) {
            handler(result);
        }
    } catch (err) {
        handleError('Unable to reach the server. Please try again.');
    }
};

// Hide the error message box by adding the 'hidden' class to it, css will handle the rest
const hideError = () => {
    document.getElementById('errorBox').classList.add('hidden');
};

module.exports = {
    handleError,
    sendPost,
    hideError,
};
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // User database
    const users = {
        'radha': 'krishna',
        'user1': 'pass1',
        'user2': 'pass2',
        'user3': 'pass3',
        'user4': 'pass4',
        'user5': 'pass5',
        'user6': 'pass6'
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = loginForm.username.value;
            const password = loginForm.password.value;

            // Check if user exists and password is correct
            if (users[username] && users[username] === password) {
                // On successful login, store the user in session storage
                sessionStorage.setItem('currentUser', username);
                // Redirect to the main application page
                window.location.href = 'content.html';
            } else {
                // On failed login, display an error message
                errorMessage.textContent = 'Invalid username or password.';
            }
        });
    }
});

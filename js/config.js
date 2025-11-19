// Configuration
const CONFIG = {
    API_URL: 'https://exq-frontend.vercel.app/api',
    SOCKET_URL: 'https://exq-frontend.vercel.app',
    RAZORPAY_KEY_ID: 'rzp_test_YOUR_KEY_ID' // Replace with your Razorpay key
};

// Global state
const STATE = {
    user: null,
    socket: null,
    currentTeam: null,
    isAuthenticated: false
};

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        STATE.user = user;
        STATE.isAuthenticated = true;
        showApp();
    }
});
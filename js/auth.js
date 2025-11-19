// Authentication Functions
let isRegisterMode = false;

// Toggle between login and register
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const registerFields = document.getElementById('registerFields');
    const authTitle = document.getElementById('authTitle');
    const authButton = document.getElementById('authButton');
    const toggleButton = document.getElementById('toggleButton');

    if (isRegisterMode) {
        registerFields.classList.remove('hidden');
        authTitle.textContent = 'Create Account';
        authButton.textContent = 'Create Account';
        toggleButton.textContent = 'Already have an account? Sign In';
    } else {
        registerFields.classList.add('hidden');
        authTitle.textContent = 'Welcome Back';
        authButton.textContent = 'Sign In';
        toggleButton.textContent = "Don't have an account? Sign Up";
    }

    // Clear form and error
    document.getElementById('authForm').reset();
    hideError();
}

// Toggle role-specific fields
function toggleRoleFields() {
    const role = document.getElementById('regRole').value;
    const studentFields = document.getElementById('studentFields');
    
    if (role === 'student') {
        studentFields.classList.remove('hidden');
    } else {
        studentFields.classList.add('hidden');
    }
}

// Handle auth form submission
document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isRegisterMode) {
            // Register
            const userData = {
                name: document.getElementById('regName').value,
                email: email,
                password: password,
                role: document.getElementById('regRole').value,
                department: document.getElementById('regDepartment').value
            };

            if (userData.role === 'student') {
                userData.rollNumber = document.getElementById('regRollNumber').value;
                userData.year = parseInt(document.getElementById('regYear').value);
            }

            const data = await API.register(userData);
            handleAuthSuccess(data);
        } else {
            // Login
            const data = await API.login(email, password);
            handleAuthSuccess(data);
        }
    } catch (error) {
        showError(error.message || 'Authentication failed');
    }
});

// Handle successful authentication
function handleAuthSuccess(data) {
    STATE.user = data;
    STATE.isAuthenticated = true;
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('token', data.token);
    showApp();
}

// Logout
function logout() {
    STATE.user = null;
    STATE.isAuthenticated = false;
    STATE.currentTeam = null;
    localStorage.removeItem('user');
    
    if (STATE.socket) {
        STATE.socket.disconnect();
        STATE.socket = null;
    }
    
    // Show auth page
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
}

// Show main app
function showApp() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    
    // Update navbar: show user's name in the role slot (clickable to open profile)
    const userRoleEl = document.getElementById('userRole');
    userRoleEl.textContent = STATE.user.name;
    userRoleEl.style.cursor = 'pointer';
    userRoleEl.title = 'View profile';
    userRoleEl.onclick = () => showPage('profile');
    
    // Show role-specific links
    document.querySelectorAll('.student-only').forEach(el => {
        el.style.display = STATE.user.role === 'student' ? 'block' : 'none';
    });
    document.querySelectorAll('.faculty-only').forEach(el => {
        el.style.display = STATE.user.role === 'faculty' ? 'block' : 'none';
    });
    
    // Show appropriate dashboard based on role
    if (STATE.user.role === 'admin') {
        showPage('admin-dashboard');
    } else {
        // Both students and faculty now land on the homepage,
        // which will render role-specific content.
        showPage('homepage');
    }
    
    // Initialize socket
    initSocket();
}

// Show/hide error messages
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError() {
    const errorEl = document.getElementById('errorMessage');
    errorEl.classList.add('hidden');
}
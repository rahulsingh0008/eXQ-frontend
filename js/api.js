// API Helper Functions
const API = {
    // Generic request function
    async request(endpoint, options = {}) {
        const user = JSON.parse(localStorage.getItem('user'));
        const headers = {
            'Content-Type': 'application/json',
            ...(user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {})
        };

        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            console.error('Endpoint:', `${CONFIG.API_URL}${endpoint}`);
            
            // Check if it's a network error
            if (!error.message || error.message === 'Failed to fetch') {
                throw new Error('Failed to connect to server. Make sure the backend is running on port 5000.');
            }
            
            if (error.message.includes('401') || error.message.includes('token')) {
                logout();
            }
            throw error;
        }
    },

    // Auth endpoints
    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    getProfile() {
        return this.request('/auth/profile');
    },

    // Student endpoints
    createTeam(teamData) {
        return this.request('/students/teams', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
    },

    getMyTeam() {
        return this.request('/students/teams/my-team');
    },

    leaveTeam() {
        return this.request('/students/teams/leave', {
            method: 'DELETE'
        });
    },

    postProblem(problemData) {
        return this.request('/students/problems', {
            method: 'POST',
            body: JSON.stringify(problemData)
        });
    },

    getMyProblems() {
        return this.request('/students/problems/my-problems');
    },

    getPurchasedProblems() {
        return this.request('/students/problems/purchased');
    },

    // Problem endpoints
    getProblems(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/problems${query ? '?' + query : ''}`);
    },

    getProblemById(id) {
        return this.request(`/problems/${id}`);
    },

    getCategories() {
        return this.request('/problems/domains/list');
    },

    // Payment endpoints
    createOrder(problemId) {
        return this.request('/payments/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problemId })
        });
    },

    verifyPayment(paymentData) {
        return this.request('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },

    getMyPayments() {
        return this.request('/payments/my-payments');
    },

    // Chat endpoints
    getTeamChats(teamId, page = 1) {
        return this.request(`/chats/team/${teamId}?page=${page}&limit=50`);
    },

    sendMessage(teamId, message) {
        return this.request(`/chats/team/${teamId}`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    },

    // Faculty endpoints
    getAllTeams() {
        return this.request('/faculty/teams');
    },

    getMyFacultyTeams() {
        return this.request('/faculty/my-teams');
    },

    getTeamById(id) {
        return this.request(`/faculty/teams/${id}`);
    },

    giveFeedback(feedbackData) {
        return this.request('/faculty/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    },

    upvoteProblem(problemId) {
        return this.request(`/faculty/problems/${problemId}/upvote`, {
            method: 'POST'
        });
    },

    // Leaderboard endpoints
    getFacultyLeaderboard() {
        return this.request('/leaderboard/faculty');
    },

    // Admin endpoints
    getDashboardStats() {
        return this.request('/admin/stats');
    },

    getAllUsers() {
        return this.request('/admin/users');
    },

    toggleUserStatus(userId) {
        return this.request(`/admin/users/${userId}/toggle-status`, {
            method: 'PUT'
        });
    },

    deleteUser(userId) {
        return this.request(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    },

    getAdminProblems() {
        return this.request('/admin/problems');
    },

    // approveProblem(problemId, approved) {
    //     return this.request(`/admin/problems/${problemId}/approve`, {
    //         method: 'PUT',
    //         body: JSON.stringify({ approved })
    //     });
    // },

    deleteProblem(problemId) {
        return this.request(`/admin/problems/${problemId}`, {
            method: 'DELETE'
        });
    },

    getAllPayments() {
        return this.request('/admin/payments');
    }
};
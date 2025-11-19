async function loadAdminDashboard() {
    try {
        const stats = await API.getDashboardStats();
        
        document.getElementById('adminTotalUsers').textContent = stats.stats.totalUsers;
        document.getElementById('adminTotalTeams').textContent = stats.stats.totalTeams;
        document.getElementById('adminTotalProblems').textContent = stats.stats.totalProblems;
        document.getElementById('adminRevenue').textContent = `₹${stats.stats.totalRevenue}`;
        
        // Load users tab by default
        loadAdminUsers();
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

async function loadAdminUsers() {
    try {
        const data = await API.getAllUsers();
        const container = document.getElementById('adminUsersList');
        
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td style="text-transform: capitalize;">${user.role}</td>
                            <td>${user.isActive ? '✓ Active' : '✗ Inactive'}</td>
                            <td>
                                <button onclick="toggleUserStatus('${user._id}')" class="btn btn-sm">
                                    ${user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function toggleUserStatus(userId) {
    try {
        await API.toggleUserStatus(userId);
        loadAdminUsers();
    } catch (error) {
        alert('Failed to toggle user status');
    }
}

function showAdminTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.add('hidden'));
    
    event.target.classList.add('active');
    
    if (tab === 'users') {
        document.getElementById('adminUsersTab').classList.remove('hidden');
        loadAdminUsers();
    } else if (tab === 'problems') {
        document.getElementById('adminProblemsTab').classList.remove('hidden');
    } else if (tab === 'payments') {
        document.getElementById('adminPaymentsTab').classList.remove('hidden');
    }
}
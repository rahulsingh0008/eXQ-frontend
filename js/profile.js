// Load profile and purchased problems
async function loadProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) throw new Error('Not logged in');

        // Fetch profile
        const data = await API.getProfile();

        // Profile info (without teams)
        const profileContainer = document.getElementById('profileDetails');
        profileContainer.innerHTML = `
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Role:</strong> ${data.role}</p>
            <p><strong>Department:</strong> ${data.department || 'N/A'}</p>
            <p><strong>Roll Number:</strong> ${data.rollNumber || 'N/A'}</p>
            <p><strong>Year:</strong> ${data.year || 'N/A'}</p>
            <p><strong>Teams:</strong> ${data.teams && data.teams.length ? data.teams.map(t => t.name).join(', ') : 'None'}</p>
        `;

        // Fetch purchased problems
        const purchased = await API.getPurchasedProblems();
        const purchasedContainer = document.getElementById('purchasedProblemsList');

        if (!purchased || purchased.length === 0) {
            purchasedContainer.innerHTML = '<p>No purchased problems yet.</p>';
        } else {
            purchasedContainer.innerHTML = purchased.map(p => `
            <div class="problem-card purchased-card">
                <h4>${p.domain}</h4>
                <p><strong>Title:</strong> ${p.title}</p>
                <p><strong>Description:</strong> ${p.description}</p>
                <p><strong>Price:</strong> ₹${p.price}</p>
            </div>
        `).join('');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        const profileContainer = document.getElementById('profileDetails');
        const purchasedContainer = document.getElementById('purchasedProblemsList');
        if (profileContainer) profileContainer.innerHTML = '<p style="color:red;">Failed to load profile</p>';
        if (purchasedContainer) purchasedContainer.innerHTML = '';
    }
}

// Attach click handler to user menu
document.addEventListener('DOMContentLoaded', () => {
    const userRoleEl = document.getElementById('userRole');
    if (userRoleEl) userRoleEl.addEventListener('click', () => {
        showPage('profile');
        loadProfile();
    });
});

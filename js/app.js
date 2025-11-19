function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    
    // Show requested page
    const page = document.getElementById(pageName + 'Page');
    if (page) {
        page.classList.remove('hidden');
        
        // Load page data
        if (pageName === 'homepage') loadHomepage();
        else if (pageName === 'problems') loadProblems();
        else if (pageName === 'team') loadTeam(false);
        else if (pageName === 'teams-list') loadTeamsList();
        else if (pageName === 'admin-dashboard') loadAdminDashboard();
        else if (pageName === 'profile') loadProfile();
        else if (pageName === 'leaderboard') loadFacultyLeaderboardPage();
    }
}

async function loadTeamsList() {
    try {
    const container = document.getElementById('teamsListGrid');

    // Load both assigned teams (for this faculty) and all teams
    const [myTeamsData, allTeamsData] = await Promise.all([
      API.getMyFacultyTeams().catch(() => ({ teams: [] })),
      API.getAllTeams()
    ]);

    const myTeams = myTeamsData.teams || [];
    const allTeams = allTeamsData.teams || [];

    // Helper to render a team card
    const renderTeamCard = (team) => `
        <div class="team-card">
            <h3>${team.name}</h3>
            <p>${team.description || 'No description'}</p>
            <div class="team-meta">
                <span>Members: ${team.members?.length || 0}/${team.maxMembers}</span>
                <span>Department: ${team.department || 'N/A'}</span>
            </div>
            <div class="team-members-preview">
                ${team.members?.slice(0, 3).map(member => `
                    <div class="member-avatar" title="${member.name}">${member.name.charAt(0)}</div>
                `).join('') || 'No members'}
            </div>
            <button onclick="viewTeamDetails('${team._id}')" class="btn btn-primary btn-sm">View Team</button>
        </div>
    `;

    if (!allTeams.length && !myTeams.length) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">No teams found</p>';
      return;
    }

    let html = '';

    // Section: My Assigned Teams (faculty homepage feel)
    html += `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">My Assigned Teams</h2>
        <p style="color: #6b7280; margin-bottom: 1.25rem;">Teams you are mentoring / assigned to.</p>
        <div class="teams-grid">
          ${
            myTeams.length
              ? myTeams.map(renderTeamCard).join('')
              : '<p style="grid-column: 1/-1; padding: 1.5rem; color: #9ca3af;">No teams assigned to you yet.</p>'
          }
        </div>
      </div>
    `;

    // Section: All Teams
    html += `
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">All Student Teams</h2>
        <p style="color: #6b7280; margin-bottom: 1.25rem;">Browse all active teams in the system.</p>
        <div class="teams-grid">
          ${allTeams.map(renderTeamCard).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    } catch (error) {
        console.error('Error loading teams list:', error);
        document.getElementById('teamsListGrid').innerHTML = '<p style="color: red;">Error loading teams</p>';
    }
}

// Faculty Leaderboard page loader (visible to both students and faculty)
async function loadFacultyLeaderboardPage() {
    const container = document.getElementById('facultyLeaderboardList');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center; padding: 1.5rem; color: #6b7280;">Loading leaderboard...</p>';

    try {
        const data = await API.getFacultyLeaderboard();
        const leaderboard = data.leaderboard || [];

        if (!leaderboard.length) {
            container.innerHTML = '<p style="text-align:center; padding: 2rem; color: #6b7280;">No faculty activity yet.</p>';
            return;
        }

        const rowsHtml = leaderboard.map((entry, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.department}</td>
                <td>${entry.assignedTeams}</td>
                <td>${entry.feedbackCount}</td>
                <td>${entry.upvotesGiven}</td>
                <td>${entry.score}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Faculty</th>
                        <th>Department</th>
                        <th>Assigned Teams</th>
                        <th>Feedback Given</th>
                        <th>Upvotes Given</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading faculty leaderboard:', error);
        container.innerHTML = '<p style="text-align:center; padding: 2rem; color: #ef4444;">Failed to load leaderboard. Please try again.</p>';
    }
}

async function viewTeamDetails(teamId) {
    try {
        const team = await API.getTeamById(teamId);
        const feedback = await API.getTeamById(teamId).then(() => {
            // You can fetch feedback here if needed
        });
        
        // Show team details in a modal or navigate to a detail view
        alert(`Team: ${team.name}\nMembers: ${team.members?.length || 0}\nDepartment: ${team.department}`);
    } catch (error) {
        alert('Error loading team details');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
    document.getElementById('modalOverlay').classList.add('hidden');
}

function showPostProblemModal() {
    document.getElementById('postProblemModal').classList.remove('hidden');
    document.getElementById('modalOverlay').classList.remove('hidden');
}

document.getElementById('postProblemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const problemData = {
        title: document.getElementById('problemTitle').value,
        description: document.getElementById('problemDesc').value,
        domain: document.getElementById('problemSubject').value,
        price: parseInt(document.getElementById('problemPrice').value)
    };
    
    try {
        await API.postProblem(problemData);
        alert('Problem posted successfully! It will be visible after admin approval.');
        closeModal();
        document.getElementById('postProblemForm').reset();
        if (STATE.user.role === 'student') loadHomepage();
    } catch (error) {
        alert(error.message || 'Failed to post problem');
    }
});
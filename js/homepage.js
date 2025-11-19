async function loadHomepage() {
    if (STATE.user.role === 'admin') {
        loadAdminDashboard();
        return;
    }

    // Faculty: show all teams assigned to this faculty on the homepage
    if (STATE.user.role === 'faculty') {
        await loadFacultyHomepage();
        return;
    }

    // Students: show their own team(s)
    try {
        // Fetch teams info
        let teams = null;
        try {
            teams = await API.getMyTeam();
        } catch (error) {
            teams = null;
        }

        // Store teams for use by click handlers and render all joined teams
        window.HOMEPAGE_TEAMS = Array.isArray(teams) ? teams : (teams ? [teams] : []);

        displaySimpleTeamCard(window.HOMEPAGE_TEAMS);

    } catch (error) {
        console.error('Error loading homepage:', error);
    }
}

// Faculty homepage: list all teams assigned to this faculty
async function loadFacultyHomepage() {
    try {
        const container = document.getElementById('homepageTeamsSection');
        if (!container) return;

        container.innerHTML = '<div class="container" id="homepageContainer"></div>';
        const inner = document.getElementById('homepageContainer');

        const data = await API.getMyFacultyTeams().catch(() => ({ teams: [] }));
        const teams = data.teams || [];

        // Store for openTeam handler (reuses same click behavior)
        window.HOMEPAGE_TEAMS = teams;

        if (!teams.length) {
            inner.innerHTML = `
                <div style="margin-top: 2.5rem;">
                    <div style="margin-bottom: 2rem;">
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">My Assigned Teams</h2>
                        <p style="color: #6b7280; font-size: 1rem;">No teams have been assigned to you yet.</p>
                    </div>
                    <div class="content-card" style="text-align: center; padding: 2.5rem;">
                        <p style="color: #6b7280;">Once teams are assigned to you, they will appear here.</p>
                    </div>
                </div>
            `;
            return;
        }

        const cardsHtml = teams.map(team => `
            <div class="team-card" onclick="openTeam('${team._id}')" style="cursor: pointer; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1.25rem; color: white; text-align: center; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); border: none;">
                <div style="font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">👥</div>
                <h3 style="margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">${team.name}</h3>
                <p style="font-size: 1rem; opacity: 0.95; margin: 0 0 1rem 0; font-weight: 400;">${team.domain || 'No domain'}</p>
                <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.95;">
                    <span>Members: ${team.members?.length || 0}/${team.maxMembers}</span>
                </div>
                <div style="margin-top: 0.25rem; font-size: 0.9rem; opacity: 0.9;">
                    <span>Department: ${team.department || 'N/A'}</span>
                </div>
                <div style="margin-top: 1rem; font-size: 0.95rem; opacity: 1; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
                    <span>Open team chat</span>
                    <i class="fas fa-arrow-right" style="font-size: 0.9rem;"></i>
                </div>
            </div>
        `).join('');

        inner.innerHTML = `
            <div style="margin-top: 2.5rem;">
                <div style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">My Assigned Teams</h2>
                    <p style="color: #6b7280; font-size: 1rem;">Tap a team to view its members and open the team chat.</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                    ${cardsHtml}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading faculty homepage:', error);
    }
}

function displaySimpleTeamCard(teams) {
    // Render into the dedicated homepage teams section so we don't overwrite the whole page
    const container = document.getElementById('homepageTeamsSection');
    if (!container) return; // nothing to render into
    container.innerHTML = '<div class="container" id="homepageContainer"></div>';
    const inner = document.getElementById('homepageContainer');
    
    if (!teams || teams.length === 0) {
        // Show message if not part of any team
        inner.innerHTML = `
            <div style="margin-top: 2.5rem;">
                <div style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">Your Teams</h2>
                    <p style="color: #6b7280; font-size: 1rem;">You are not part of any team yet</p>
                </div>
                <div class="content-card" style="text-align: center; padding: 3rem; background: white; border-radius: 1.25rem; border: 2px dashed #e5e7eb;">
                    <div style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.4;">👥</div>
                    <p style="color: #6b7280; margin-bottom: 2rem; font-size: 1.1rem; font-weight: 500;">Join or create a team to get started</p>
                    <button onclick="showPage('team')" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Create or Join Team
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Build cards for each team with improved styling
    const cardsHtml = teams.map(team => `
        <div class="team-card" onclick="openTeam('${team._id}')" style="cursor: pointer; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1.25rem; color: white; text-align: center; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); border: none;">
            <div style="font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">👥</div>
            <h3 style="margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">${team.name}</h3>
            <p style="font-size: 1rem; opacity: 0.95; margin: 0 0 1rem 0; font-weight: 400;">${team.domain || 'No domain'}</p>
            <div style="margin-top: 1rem; font-size: 0.95rem; opacity: 1; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
                <span>Open chat</span>
                <i class="fas fa-arrow-right" style="font-size: 0.9rem;"></i>
            </div>
        </div>
    `).join('');

    inner.innerHTML = `
        <div style="margin-top: 2.5rem;">
            <div style="margin-bottom: 2rem;">
                <h2 style="font-size: 1.75rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">Your Teams</h2>
                <p style="color: #6b7280; font-size: 1rem;">Tap a team to open its chat</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">${cardsHtml}</div>
        </div>
    `;
}

// Open team from homepage: set STATE.currentTeam and navigate to team page
function openTeam(teamId) {
    try {
        const teams = window.HOMEPAGE_TEAMS || [];
        const team = teams.find(t => t._id === teamId);
        if (team) {
            STATE.currentTeam = team;
        } else {
            // If not found, clear previous selection
            STATE.currentTeam = null;
        }
        showPage('team');
    } catch (err) {
        console.error('Failed to open team:', err);
        showPage('team');
    }
}

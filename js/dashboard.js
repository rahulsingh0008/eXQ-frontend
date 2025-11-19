async function loadDashboard() {
    if (STATE.user.role === 'admin') {
        loadAdminDashboard();
        return;
    }

    try {
        // Update user info
        document.getElementById('dashboardUserName').textContent = STATE.user.name;
        
        let userInfo = '';
        if (STATE.user.rollNumber) {
            userInfo = `Roll Number: ${STATE.user.rollNumber}`;
        }
        if (STATE.user.department) {
            userInfo += userInfo ? ` | ${STATE.user.department}` : STATE.user.department;
        }
        document.getElementById('dashboardUserInfo').textContent = userInfo;

        // Fetch team info
        let team = null;
        let teamMembers = 0;
        try {
            team = await API.getMyTeam();
            teamMembers = team.members?.length || 0;
        } catch (error) {
            teamMembers = 0;
        }

        // Fetch problems
        const myProblems = await API.getMyProblems();
        const purchasedProblems = await API.getPurchasedProblems();

        // Update stats
        document.getElementById('teamMembersCount').textContent = teamMembers;
        document.getElementById('postedProblemsCount').textContent = myProblems.length;
        document.getElementById('purchasedProblemsCount').textContent = purchasedProblems.length;

        // Display joined team
        displayJoinedTeam(team);

        // Display my problems
        displayMyProblems(myProblems.slice(0, 5));
        displayPurchasedProblems(purchasedProblems.slice(0, 5));

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function displayJoinedTeam(team) {
    const container = document.getElementById('myProblemsList').parentElement.parentElement;
    
    if (!team) {
        // Insert joined team section before problems list
        const joinedTeamSection = document.createElement('div');
        joinedTeamSection.className = 'content-card';
        joinedTeamSection.innerHTML = '<h3>My Team</h3><p style="color: #6b7280; padding: 2rem; text-align: center;">You are not part of any team yet. <a href="#" onclick="showPage(\'team\')" style="color: #667eea; cursor: pointer;">Join or create a team</a></p>';
        container.insertBefore(joinedTeamSection, container.firstChild);
        return;
    }

    // Insert joined team section before problems list
    const joinedTeamSection = document.createElement('div');
    joinedTeamSection.className = 'content-card';
    
    let membersHtml = team.members.map(member => `
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f3f4f6; border-radius: 0.5rem; margin-bottom: 0.5rem;">
            <div style="width: 32px; height: 32px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${member.name.charAt(0)}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 500;">${member.name}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">${member.rollNumber || 'N/A'}</div>
            </div>
            ${member._id === team.leader._id ? '<span style="background: #fbbf24; color: #78350f; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">Leader</span>' : ''}
        </div>
    `).join('');

    joinedTeamSection.innerHTML = `
        <h3>${team.name}</h3>
        <p style="color: #6b7280; margin-bottom: 1rem;">${team.description || 'No description'}</p>
        <div style="background: #eff6ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 4px solid #667eea;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <p style="color: #6b7280; font-size: 0.875rem;">Team Members</p>
                    <p style="font-weight: bold; font-size: 1.25rem;">${team.members.length}/${team.maxMembers}</p>
                </div>
                <div>
                    <p style="color: #6b7280; font-size: 0.875rem;">Department</p>
                    <p style="font-weight: bold; font-size: 1.25rem;">${team.department || 'N/A'}</p>
                </div>
            </div>
        </div>
        <h4 style="margin-bottom: 0.75rem;">Team Members</h4>
        ${membersHtml}
        <button onclick="showPage('team')" class="btn btn-primary btn-sm" style="margin-top: 1rem; width: 100%;">Manage Team</button>
    `;
    
    container.insertBefore(joinedTeamSection, container.firstChild);
}

function displayMyProblems(problems) {
    const container = document.getElementById('myProblemsList');
    
    if (problems.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: #6b7280; padding: 2rem;">No problems posted yet</p>';
        return;
    }

    container.innerHTML = problems.map(problem => `
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">${problem.title}</h4>
            <p style="color: #6b7280; font-size: 0.875rem;">${problem.category} • ${problem.difficulty}</p>
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem;">
                <span style="color: #667eea;">₹${problem.price}</span>
                <span style="color: #6b7280;">${problem.upvotes} upvotes</span>
                <span style="color: ${problem.isApproved ? '#10b981' : '#f59e0b'};">
                    ${problem.isApproved ? '✓ Approved' : '⏳ Pending'}
                </span>
            </div>
        </div>
    `).join('');
}

function displayPurchasedProblems(problems) {
    const container = document.getElementById('purchasedProblemsList');
    
    if (problems.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: #6b7280; padding: 2rem;">No purchased problems yet</p>';
        return;
    }

    container.innerHTML = problems.map(problem => `
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">${problem.title}</h4>
            <p style="color: #6b7280; font-size: 0.875rem;">${problem.category} • ${problem.difficulty}</p>
            <button onclick="viewProblemSolution('${problem._id}')" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">
                View Solution →
            </button>
        </div>
    `).join('');
}
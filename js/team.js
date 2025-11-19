async function loadTeam(showTeamChat = false) {
    try {
        let team = null;
        
        // If a team was selected from the homepage (team card click), use it and show chat
        if (STATE.currentTeam && STATE.currentTeam._id) {
            team = STATE.currentTeam;
            showTeamChat = true; // Force show chat when team is selected from homepage
        } else if (showTeamChat) {
            // showTeamChat is explicitly true (after join/create), fetch team
            const teams = await API.getMyTeam();
            if (Array.isArray(teams)) {
                team = teams[0] || null;
            } else {
                team = teams || null;
            }
            STATE.currentTeam = team;
        } else {
            // Coming from homepage button - show create/join section
            STATE.currentTeam = null;
            document.getElementById('noTeamSection').classList.remove('hidden');
            document.getElementById('teamSection').classList.add('hidden');
            return; // Exit early - just show create/join section
        }
        
        // Show team section with chat
        if (team && team._id) {
            // Show team section
            document.getElementById('noTeamSection').classList.add('hidden');
            document.getElementById('teamSection').classList.remove('hidden');
            
            // Display team info
            document.getElementById('teamName').textContent = team.name;
            document.getElementById('teamDescription').textContent = team.description || '';
            document.getElementById('teamInviteCode').textContent = team.name; // Team name is used as invite code
            document.getElementById('teamMemberCount').textContent = `${team.members.length}/${team.maxMembers}`;
            
            // Display members
            const membersList = document.getElementById('teamMembersList');
            membersList.innerHTML = (team.members || []).map(member => `
                <div class="team-member">
                    <div class="member-avatar">${member.name.charAt(0)}</div>
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        ${member._id === team.leader._id ? '<div class="member-role">Leader</div>' : ''}
                    </div>
                </div>
            `).join('');
            
            // Join socket room and load chat
            joinTeamSocket(team._id);
            loadChat(team._id);
        } else {
            // No team found or invalid team - show create/join team section
            STATE.currentTeam = null;
            document.getElementById('noTeamSection').classList.remove('hidden');
            document.getElementById('teamSection').classList.add('hidden');
        }
        
    } catch (error) {
        // No team found
        document.getElementById('noTeamSection').classList.remove('hidden');
        document.getElementById('teamSection').classList.add('hidden');
    }
}

async function loadChat(teamId) {
    try {
        const data = await API.getTeamChats(teamId);
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        
        data.chats.forEach(chat => addMessageToChat(chat));
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

function addMessageToChat(message) {
    const container = document.getElementById('chatMessages');
    const isSent = message.sender._id === STATE.user._id;
    
    const div = document.createElement('div');
    div.className = `chat-message ${isSent ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="message-sender">${message.sender.name}</div>
        <div class="message-text">${message.message}</div>
        <div class="message-time">${new Date(message.createdAt).toLocaleTimeString()}</div>
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Chat form
document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatMessageInput');
    const message = input.value.trim();
    
    if (message && STATE.currentTeam) {
        sendSocketMessage(STATE.currentTeam._id, message);
        input.value = '';
    }
});

async function joinTeam() {
    const inviteCode = document.getElementById('inviteCodeInput').value.trim();
    if (!inviteCode) {
        alert('Please enter an invite code');
        return;
    }
    
    try {
        await API.joinTeam(inviteCode);
        alert('Successfully joined team!');
        loadTeam(true);
    } catch (error) {
        alert(error.message || 'Failed to join team');
    }
}

async function leaveTeam() {
    if (!confirm('Are you sure you want to leave the team?')) return;
    
    try {
        await API.leaveTeam();
        alert('You have left the team');
        STATE.currentTeam = null;
        document.getElementById('noTeamSection').classList.remove('hidden');
        document.getElementById('teamSection').classList.add('hidden');
    } catch (error) {
        alert(error.message || 'Failed to leave team');
    }
}

function showCreateTeamModal() {
    document.getElementById('createTeamModal').classList.remove('hidden');
    document.getElementById('modalOverlay').classList.remove('hidden');
}

document.getElementById('createTeamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const teamData = {
        name: document.getElementById('teamNameInput').value,
        description: document.getElementById('teamDescInput').value,
        maxMembers: parseInt(document.getElementById('teamMaxInput').value)
    };
    
    try {
        await API.createTeam(teamData);
        alert('Team created successfully!');
        closeModal();
        loadTeam(true);
    } catch (error) {
        alert(error.message || 'Failed to create team');
    }
});
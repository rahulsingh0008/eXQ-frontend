function initSocket() {
    if (!STATE.user || STATE.socket) return;

    STATE.socket = io(CONFIG.SOCKET_URL, {
        auth: { token: STATE.user.token }
    });

    STATE.socket.on('connect', () => {
        console.log('✅ Socket connected');
        document.getElementById('chatStatus').style.color = '#10b981';
    });

    STATE.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        document.getElementById('chatStatus').style.color = '#ef4444';
    });

    STATE.socket.on('receive-message', (message) => {
        addMessageToChat(message);
    });

    STATE.socket.on('user-typing', ({ userName }) => {
        const indicator = document.getElementById('typingIndicator');
        indicator.textContent = `${userName} is typing...`;
        indicator.classList.remove('hidden');
    });

    STATE.socket.on('user-stop-typing', () => {
        document.getElementById('typingIndicator').classList.add('hidden');
    });
}

function joinTeamSocket(teamId) {
    if (STATE.socket && STATE.user) {
        STATE.socket.emit('join-team', {
            userId: STATE.user._id,
            teamId: teamId
        });
    }
}

function sendSocketMessage(teamId, message) {
    if (STATE.socket) {
        STATE.socket.emit('send-message', {
            teamId,
            senderId: STATE.user._id,
            message
        });
    }
}
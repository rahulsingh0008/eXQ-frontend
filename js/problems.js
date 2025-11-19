let currentFilters = {
    domain: '',
    sort: 'latest'
};

async function loadProblems() {
    try {
        document.getElementById('loadingProblems').classList.remove('hidden');
        
        // Load domains with fallback
        let domains = [];
        try {
            domains = await API.getCategories();
        } catch (error) {
            console.error('Error loading domains:', error);
            // Fallback domains if API fails
            domains = [
                'Data Structures',
                'Algorithms',
                'Web Development',
                'Database Design',
                'Computer Networks',
                'Operating Systems',
                'Software Engineering',
                'Machine Learning',
                'Cybersecurity',
                'Mobile Development'
            ];
        }
        
        // Populate domains filter
        const domainsFilter = document.getElementById('domainsFilter');
        const selectedDomain = currentFilters.domain || '';
        if (domains && domains.length > 0) {
            domainsFilter.innerHTML = '<option value="">Choose domain</option>' +
                domains.map(domain => 
                    `<option value="${domain}" ${domain === selectedDomain ? 'selected' : ''}>${domain}</option>`
                ).join('');
        } else {
            domainsFilter.innerHTML = '<option value="">Choose domain</option>';
        }
        
        // Preserve sort filter selection
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.value = currentFilters.sort || 'latest';
        }

        // Load problems
        const data = await API.getProblems(currentFilters);
        displayProblems(data.problems);
        
        document.getElementById('loadingProblems').classList.add('hidden');
    } catch (error) {
        console.error('Error loading problems:', error);
        document.getElementById('loadingProblems').classList.add('hidden');
        document.getElementById('problemsGrid').innerHTML = 
            '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ef4444;">Error loading problems. Please try again.</p>';
    }
}

function displayProblems(problems) {
    const container = document.getElementById('problemsGrid');
    
    if (problems.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">No problems found</p>';
        return;
    }

    container.innerHTML = problems.map(problem => {
        const isFaculty = localStorage.getItem('userRole') === 'faculty';
        
        return `
        <div class="problem-card">
            <div class="problem-header">
                <span class="problem-domain" style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem;">${problem.domain}</span>
                ${!isFaculty ? `<span class="problem-price">₹${problem.price}</span>` : ''}
            </div>
            <h3 class="problem-title">${isFaculty && problem.title ? problem.title : `Problem ${problem._id.substring(0, 8)}`}</h3>
            <p class="problem-description">${isFaculty && problem.description ? problem.description.substring(0, 100) + '...' : 'Hidden until purchased'}</p>
            <div class="problem-meta">
                <span>👍 ${problem.upvotes} 👎 ${problem.downvotes || 0}</span>
                ${isFaculty ? `
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                        <button onclick="toggleUpvote('${problem._id}')" style="background: ${problem.hasUpvoted ? '#d1fae5' : 'transparent'}; border: 2px solid ${problem.hasUpvoted ? '#10b981' : '#e5e7eb'}; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 1.1rem; transition: all 0.2s;" title="${problem.hasUpvoted ? 'Remove upvote' : 'Upvote'}">👍 ${problem.hasUpvoted ? '✓' : ''}</button>
                        <button onclick="toggleDownvote('${problem._id}')" style="background: ${problem.hasDownvoted ? '#fee2e2' : 'transparent'}; border: 2px solid ${problem.hasDownvoted ? '#ef4444' : '#e5e7eb'}; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 1.1rem; transition: all 0.2s;" title="${problem.hasDownvoted ? 'Remove downvote' : 'Downvote'}">👎 ${problem.hasDownvoted ? '✗' : ''}</button>
                    </div>
                ` : ''}
            </div>
            <div class="problem-actions">
                <button onclick="viewProblemDetail('${problem._id}')" class="btn btn-primary">View Details</button>
                ${!isFaculty && !problem.hasPurchased ? 
                    `<button onclick="purchaseProblem('${problem._id}')" class="btn btn-success">Buy</button>` :
                    !isFaculty ? `<button class="btn btn-success" disabled>✓ Purchased</button>` : ''
                }
            </div>
        </div>
    `}).join('');
}

async function viewProblemDetail(problemId) {
    try {
        const problem = await API.getProblemById(problemId);
        const isFaculty = localStorage.getItem('userRole') === 'faculty';
        
        const modal = document.getElementById('problemDetailModal');
        
        let content = '';
        
        if (isFaculty) {
            // Faculty sees all details with vote buttons
            document.getElementById('modalProblemTitle').textContent = problem.title;
            content = `
                <p><strong>Domain:</strong> ${problem.domain}</p>
                <p><strong>Description:</strong> ${problem.description}</p>
                <p><strong>Upvotes:</strong> 👍 ${problem.upvotes} | <strong>Downvotes:</strong> 👎 ${problem.downvotes || 0}</p>
                ${problem.createdBy ? `<p><strong>Created By:</strong> ${problem.createdBy.name}</p>` : ''}
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button onclick="toggleUpvote('${problemId}'); closeModal();" class="btn btn-primary" style="background: ${problem.hasUpvoted ? '#10b981' : '#3b82f6'}; border: 2px solid ${problem.hasUpvoted ? '#059669' : '#2563eb'}; flex: 1; min-width: 150px; font-weight: bold;">
                        ${problem.hasUpvoted ? '✓ Upvoted' : '👍 Upvote'}
                    </button>
                    <button onclick="toggleDownvote('${problemId}'); closeModal();" class="btn btn-primary" style="background: ${problem.hasDownvoted ? '#ef4444' : '#6366f1'}; border: 2px solid ${problem.hasDownvoted ? '#dc2626' : '#4f46e5'}; flex: 1; min-width: 150px; font-weight: bold;">
                        ${problem.hasDownvoted ? '✗ Downvoted' : '👎 Downvote'}
                    </button>
                </div>
            `;
        } else if (problem.hasPurchased) {
            // Student with purchase sees all details (no vote buttons)
            document.getElementById('modalProblemTitle').textContent = problem.title;
            content = `
                <p><strong>Domain:</strong> ${problem.domain}</p>
                <p><strong>Price:</strong> ₹${problem.price}</p>
                <p><strong>Description:</strong> ${problem.description}</p>
                <p><strong>Upvotes:</strong> 👍 ${problem.upvotes} | <strong>Downvotes:</strong> 👎 ${problem.downvotes || 0}</p>
            `;
            
            if (problem.solution) {
                content += `
                    <div style="background: #d1fae5; border: 1px solid #a7f3d0; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                        <h4 style="color: #065f46; margin-bottom: 0.5rem;">Solution:</h4>
                        <p style="color: #047857; white-space: pre-wrap;">${problem.solution}</p>
                    </div>
                `;
            }
        } else {
            // Student without purchase sees limited info with upvote/downvote counts
            document.getElementById('modalProblemTitle').textContent = `Problem ${problemId.substring(0, 8)}`;
            content = `
                <p><strong>Domain:</strong> ${problem.domain}</p>
                <p><strong>Price:</strong> ₹${problem.price}</p>
                <p><strong>Upvotes:</strong> 👍 ${problem.upvotes} | <strong>Downvotes:</strong> 👎 ${problem.downvotes || 0}</p>
                <div style="background: #fef3c7; border: 1px solid #fde047; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; text-align: center;">
                    <p style="color: #92400e; margin-bottom: 1rem;">This problem is locked. Purchase to unlock full details and solution.</p>
                    <button onclick="purchaseProblem('${problemId}'); closeModal();" class="btn btn-primary">
                        Purchase for ₹${problem.price}
                    </button>
                </div>
            `;
        }
        
        document.getElementById('modalProblemContent').innerHTML = content;
        
        modal.classList.remove('hidden');
        document.getElementById('modalOverlay').classList.remove('hidden');
    } catch (error) {
        alert('Error loading problem details');
    }
}

async function purchaseProblem(problemId) {
    try {
        const orderData = await API.createOrder(problemId);
        
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            order_id: orderData.orderId,
            name: 'eXQ Problem Store',
            description: 'Problem Purchase',
            handler: async function (response) {
                try {
                    await API.verifyPayment({
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        paymentId: orderData.paymentId
                    });
                    
                    alert('Payment successful! You can now view the solution.');
                    loadProblems();
                } catch (error) {
                    alert('Payment verification failed');
                }
            },
            theme: { color: '#667eea' }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        alert(error.message || 'Failed to initiate payment');
    }
}

async function toggleUpvote(problemId, currentUpvoted) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/faculty/problems/${problemId}/upvote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadProblems();
        } else {
            const error = await response.json();
            alert('Failed to upvote: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error toggling upvote:', error);
        alert('Error upvoting problem');
    }
}

async function toggleDownvote(problemId, currentDownvoted) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/faculty/problems/${problemId}/downvote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadProblems();
        } else {
            const error = await response.json();
            alert('Failed to downvote: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error toggling downvote:', error);
        alert('Error downvoting problem');
    }
}

// Add event listeners for filters
document.getElementById('domainsFilter').addEventListener('change', (e) => {
    currentFilters.domain = e.target.value;
    loadProblems();
});

document.getElementById('sortFilter').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    loadProblems();
});
// activeStatus.js

function updateStatus(status) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');

    switch (status) {
        case 'active':
            statusText.innerText = '- Active';
            statusDot.style.backgroundColor = 'green';
            break;
        case 'inactive':
            statusText.innerText = '- Inactive';
            statusDot.style.backgroundColor = 'red';
            break;
        case 'idle':
            statusText.innerText = '- Idle';
            statusDot.style.backgroundColor = 'yellow';
            break;
        default:
            statusText.innerText = 'Unknown';
            statusDot.style.backgroundColor = 'gray';
            break;
    }
}

// Change the status here (replace 'active' with your desired status)
const newStatus = 'active';
updateStatus(newStatus);

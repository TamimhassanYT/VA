async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();

        const guestView = document.getElementById('guest-view');
        const userCard = document.getElementById('user-card');
        const authZone = document.getElementById('auth-zone');

        if (data.loggedIn) {
            guestView.style.display = 'none';
            userCard.style.display = 'block';
            
            // Set the name and avatar from Discord
            document.getElementById('user-name').innerText = data.username;
            document.getElementById('user-id').innerText = `ID: ${data.id}`;
            document.getElementById('user-avatar').src = data.avatar;
            
            authZone.innerHTML = `<span style="color: #43b581">● Connected as ${data.username}</span>`;
        } else {
            guestView.style.display = 'block';
            userCard.style.display = 'none';
            authZone.innerHTML = `<span>Guest Mode</span>`;
        }
    } catch (err) {
        console.error("Auth check failed", err);
        document.getElementById('auth-zone').innerHTML = "Auth Error";
    }
}

checkAuth();

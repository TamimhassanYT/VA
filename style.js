async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();

        const guestView = document.getElementById('guest-view');
        const userCard = document.getElementById('user-card');
        const authZone = document.getElementById('auth-zone');

        if (data.loggedIn) {
            // Show Dashboard, Hide Login
            guestView.style.display = 'none';
            userCard.style.display = 'block';
            
            // Update User Info
            document.getElementById('user-name').innerText = `ID: ${data.id}`;
            document.getElementById('user-id').innerText = "Discord Authenticated";
            
            // Update Navbar
            authZone.innerHTML = `<span style="color: #43b581">● Connected</span>`;
        } else {
            guestView.style.display = 'block';
            userCard.style.display = 'none';
            authZone.innerHTML = `<a href="#login" style="color: white; text-decoration: none">Guest Mode</a>`;
        }
    } catch (err) {
        console.error("Auth check failed", err);
    }
}

checkAuth();

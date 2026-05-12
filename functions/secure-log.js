<!DOCTYPE html>
<html>
  <head>
    <script>
      window.addEventListener('DOMContentLoaded', async () => {
        console.log("Browser: Sending message to secure function...");
    
        try {
          const response = await fetch('/secure-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello from the user's browser!" })
          });
    
          const result = await response.json();
          console.log("Function Response:", result.status);
        } catch (error) {
          console.error("Error talking to function:", error);
        }
      });

      function loginWithDiscord() {
        const clientId = '1479417445260464171'; 
        
        const redirectUri = encodeURIComponent(window.location.origin + '/api/callback');
        
        // FIX: Added /oauth2/authorize to the base URL
        const discordUrl = 'https://discord.com/oauth2/authorize' + 
                           '?client_id=' + clientId + 
                           '&redirect_uri=' + redirectUri + 
                           '&response_type=code&scope=identify%20email';
        
        window.location.href = discordUrl;
      }
    </script>
  </head>
  <body>
    <button onclick="loginWithDiscord()">Sign up with Discord</button>
  </body>
</html>

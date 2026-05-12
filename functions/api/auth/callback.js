export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  
  // 1. Get the temporary code Discord sent back in the URL
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle cases where the user clicked "Cancel" or Discord had an issue
  if (error) {
    return new Response(`Discord Login Error: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response("No authorization code found in the request.", { status: 400 });
  }

  try {
    // 2. Exchange the 'code' for an Access Token
    // We send this to Discord's servers directly
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: env.DISCORD_REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VoxelAdder-Auth-Worker' // Discord requires a User-Agent
      },
    });

    const tokens = await tokenResponse.json();

    // If Discord says no, tell us exactly why
    if (!tokenResponse.ok) {
      const errorDetail = tokens.error_description || tokens.error || "Unknown Discord Error";
      return new Response(`Token Exchange Failed: ${errorDetail}`, { status: 400 });
    }

    // 3. Use that fresh token to fetch the user's Discord profile (@me)
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': 'VoxelAdder-Auth-Worker'
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return new Response("Failed to fetch user profile from Discord.", { status: 500 });
    }

    // 4. Create the Session Cookie
    // We are storing the Discord User ID in a cookie.
    // 'Max-Age=604800' keeps them logged in for 7 days.
    const cookieValue = userData.id; 
    const cookieName = "auth_session";

    // 5. Success! Send the user back to the home page with their new cookie
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/', 
        'Set-Cookie': `${cookieName}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      },
    });

  } catch (err) {
    // Catch-all for network errors or code crashes
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
}

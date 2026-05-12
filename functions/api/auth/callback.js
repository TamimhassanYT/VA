export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  
  // 1. Get the temporary code Discord sent back
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new Response(`Discord Login Error: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response("No authorization code found.", { status: 400 });
  }

  try {
    // 2. Exchange the code for an Access Token
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
      },
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(`Token Exchange Failed: ${tokens.error_description}`, { status: 400 });
    }

    // 3. Use the token to fetch the user's profile
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // 4. Create a "Session"
    // For now, we use the Discord ID as the session. 
    // In production, you'd store this in KV/D1 and use a random UUID instead.
    const userSession = userData.id;

    // 5. Redirect user back to your home page and set the Cookie
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/', // Sends user back to your main page
        'Set-Cookie': `auth_session=${userSession}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`, 
      },
    });

  } catch (err) {
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}

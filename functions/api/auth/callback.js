export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) return new Response("No authorization code provided.", { status: 400 });

  try {
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
        'User-Agent': 'VoxelAdder-Auth' 
      },
    });

    const tokens = await tokenResponse.json();
    
    // Detailed error visibility if Discord rejects the credentials or redirect URI
    if (!tokenResponse.ok) {
      return new Response(`OAuth Token Exchange Failed: ${JSON.stringify(tokens)}`, { status: 400 });
    }

    // Fetch full user profile
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const user = await userResponse.json();

    // FIXED: Appended a trailing pipe so it splits cleanly into 4 parts on the password screen
    const sessionData = `${user.id}|${user.username}|${user.avatar}|`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/#signin', // Take them directly to the signin hash modal to trigger your password logic
        'Set-Cookie': `auth_session=${encodeURIComponent(sessionData)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      },
    });
  } catch (err) {
    return new Response(`Internal Callback Error: ${err.message}`, { status: 500 });
  }
}

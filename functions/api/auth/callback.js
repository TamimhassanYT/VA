export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) return new Response("No code provided", { status: 400 });

  // DEBUG: Check if variables are even loading
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
    return new Response("Configuration Error: DISCORD_CLIENT_ID or SECRET is missing in Cloudflare Settings.", { status: 500 });
  }

  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
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

    const rawText = await response.text(); // Get raw text first to avoid JSON errors
    
    if (!response.ok) {
      return new Response(`Discord Refused Request: ${rawText}`, { status: response.status });
    }

    const tokens = JSON.parse(rawText);
    
    // Get User Data
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const userData = await userResponse.json();

    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': `auth_session=${userData.id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      },
    });

  } catch (err) {
    return new Response(`Crash Error: ${err.message}`, { status: 500 });
  }
}

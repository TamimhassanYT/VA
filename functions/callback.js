export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');
  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = context.env;

  if (!code) return new Response("No code provided", { status: 400 });

  // 1. Exchange the code for a Discord Access Token
  const tokenResponse = await fetch('https://discord.com', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: new URL(context.request.url).origin + '/api/callback',
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const tokens = await tokenResponse.json();

  // 2. Use the token to get the User's Discord Profile
  const userResponse = await fetch('https://discord.com', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const userData = await userResponse.json();

  // 3. SECURE ACTION: Here you can check if this User ID is allowed 
  // and then proceed to load/save their config to your private repo.
  
  return new Response(`Welcome, ${userData.username}! Your ID is ${userData.id}. Redirecting to editor...`, {
    headers: { "Location": "/editor", "Set-Cookie": `user_id=${userData.id}; Path=/; HttpOnly; Secure` },
    status: 302
  });
}

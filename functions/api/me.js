export async function onRequest(context) {
  const { request } = context;
  const cookieHeader = request.headers.get("Cookie") || "";
  
  const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.trim().split('=')));
  const session = cookies['auth_session'];

  if (!session) {
    return new Response(JSON.stringify({ loggedIn: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const [id, username, avatar] = decodeURIComponent(session).split('|');
  const avatarUrl = avatar !== "null" 
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` 
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return new Response(JSON.stringify({
    loggedIn: true,
    id,
    username,
    avatar: avatarUrl
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

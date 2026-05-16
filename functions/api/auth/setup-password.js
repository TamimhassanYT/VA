export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.trim().split('=')));
    const session = cookies['auth_session'];

    if (!session) {
      return new Response(JSON.stringify({ error: "No session. Login with Discord." }), { status: 401 });
    }

    const decodedSession = decodeURIComponent(session);
    const [discordId, username, avatarHash, cookiePassword] = decodedSession.split('|');

    const body = await request.json().catch(() => ({})); 
    const { action, password } = body;

    const repoOwner = "VoxelAdder";
    const repoName = "vadatabase";
    const filePath = `users/${discordId}.json`;
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const headers = {
      'Authorization': `Bearer ${env.REPOTOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'VoxelAdder-App'
    };

    const getResponse = await fetch(url, { headers });
    const userExists = getResponse.status === 200;

    // --- CHECK UI STATE ---
    if (action === "check") {
      let isAuthorized = false;
      let errPassStatus = "usersetuppass"; // Default: logged in but no file yet

      if (userExists) {
        errPassStatus = "userlogin"; // File exists, they need to log in
        const fileData = await getResponse.json();
        const userData = JSON.parse(atob(fileData.content));
        isAuthorized = (cookiePassword === userData.password);
      }
      
      return new Response(JSON.stringify({ 
        haspass: userExists, 
        authorized: isAuthorized,
        ErrPass: errPassStatus 
      }), { status: 200 });
    }

    // --- LOGIN / ACCESS ---
    if (action === "login" || action === "granted") {
      if (!userExists) return new Response(JSON.stringify({ error: "No account found." }), { status: 404 });

      const fileData = await getResponse.json();
      const userData = JSON.parse(atob(fileData.content));
      const attempt = password || cookiePassword;

      if (attempt === userData.password) {
        const secureSession = encodeURIComponent(`${discordId}|${username}|${avatarHash}|${userData.password}`);
        return new Response(JSON.stringify({ success: true, access: "authorized" }), { 
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `auth_session=${secureSession}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
          }
        });
      }
      return new Response(JSON.stringify({ error: "Wrong password." }), { status: 403 });
    }

    // --- REGISTER ---
    if (action === "register" && !userExists) {
      const newUserData = { discordId, username, avatarHash, password, createdAt: new Date().toISOString() };
      const putResponse = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Register ${username}`,
          content: btoa(JSON.stringify(newUserData, null, 2))
        })
      });

      if (putResponse.ok) {
        const secureSession = encodeURIComponent(`${discordId}|${username}|${avatarHash}|${password}`);
        return new Response(JSON.stringify({ success: true, access: "authorized" }), { 
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `auth_session=${secureSession}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
          }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Action failed." }), { status: 400 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
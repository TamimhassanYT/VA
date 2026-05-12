export async function onRequest(context) {
  const { request } = context;
  const cookieHeader = request.headers.get("Cookie") || "";
  
  // Look for our session cookie
  const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
  const session = cookies['auth_session'];

  if (!session) {
    return new Response(JSON.stringify({ loggedIn: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // In a real app, you'd verify the 'session' ID against a database (KV or D1)
  return new Response(JSON.stringify({ 
    loggedIn: true,
    user_id: session // Simplification: just returning the stored ID
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

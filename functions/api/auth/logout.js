export async function onRequest() {
  return new Response(null, {
    status: 302,
    headers: {
      // 1. Force the browser to instantly go back to the home page
      'Location': '/',
      // 2. Clear the session cookie completely
      'Set-Cookie': 'auth_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    },
  });
}
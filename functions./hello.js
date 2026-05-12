// This function runs when someone visits ://yourdomain.com
export async function onRequest(context) {
  return new Response("Hello, this is a secure server-side response!");
}

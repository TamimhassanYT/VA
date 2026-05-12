// This runs on Cloudflare's network, not the user's browser
export async function onRequestPost(context) {
  try {
    // 1. Get the data sent from the browser
    const body = await context.request.json();
    
    // 2. Perform a secure action (like logging or saving)
    console.log("Securely received from browser:", body.message);

    // 3. Send a response back to the browser
    return new Response(JSON.stringify({ status: "Received securely!" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response("Invalid request", { status: 400 });
  }
}

export async function onRequestPost(context) {
    // Your plugin update data
    const updateData = {
        version: "1.2.0",
        download_url: "https://voxeladder.zanity.net"
    };

    // Return the JSON data directly
    return new Response(JSON.stringify(updateData), {
        headers: { 
            "Content-Type": "application/json" 
        },
        status: 200
    });
}

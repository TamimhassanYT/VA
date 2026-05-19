export async function onRequestPost(context) {
    // Your plugin update data
    const updateData = {
        version: "1.0.2-1.0.6",
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

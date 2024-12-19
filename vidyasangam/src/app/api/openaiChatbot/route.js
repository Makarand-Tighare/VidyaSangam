import { CohereClientV2 } from 'cohere-ai';

// Initialize Cohere client
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY, // Ensure your API key is in environment variables
});

export async function POST(req) {
  try {
    const { messages } = await req.json(); // Extract the array of messages from the request body

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Call Cohere chat endpoint
    const cohereResponse = await cohere.chat({
      model: 'command-r-plus',
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful assistant for VidyaSangam, a platform connecting mentors and mentees at Yeshwantrao Chavan College of Engineering. You assist users with career guidance, including **LinkedIn** and **Google Meet** integration. Respond only to **career-related** queries and ignore irrelevant ones. Provide **concise** and **properly formatted** responses with spaces between points. Use **bold** and _italic_ for emphasis where necessary, and keep answers brief and relevant.`
        },
        ...messages,
      ],
    });

    // Log the full response to see what the actual structure looks like
    console.log("Full response:", cohereResponse);

    // Extract the message content properly from the response
    const botMessage = cohereResponse.message?.content?.[0]?.text || "Sorry, I couldn't process your request.";

    return new Response(JSON.stringify({ response: botMessage }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in Cohere API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process your request.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
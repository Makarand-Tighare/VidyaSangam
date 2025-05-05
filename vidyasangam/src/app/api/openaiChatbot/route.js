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

    // Find system message if it exists
    const systemMessage = messages.find(msg => msg.role === "system");
    
    // Prepare messages for Cohere API - format roles correctly
    const cohereMessages = messages
      .filter(msg => msg.role !== "system") // Remove system message from the array
      .map(msg => ({
        role: msg.role === "assistant" ? "chatbot" : msg.role, // Map assistant to chatbot for Cohere
        content: msg.content
      }));

    // Call Cohere chat endpoint with correct format
    const cohereResponse = await cohere.chat({
      model: 'command-r-plus',
      messages: [
        { 
          role: 'system', 
          content: systemMessage ? systemMessage.content : 
            `You are a helpful assistant for VidyaSangam, a platform connecting mentors and mentees at Yeshwantrao Chavan College of Engineering. You assist users with career guidance, including LinkedIn and Google Meet integration. Respond only to career-related queries and ignore irrelevant ones. Provide brief concise and properly formatted responses with spaces between points.`
        },
        ...cohereMessages,
      ],
    });

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
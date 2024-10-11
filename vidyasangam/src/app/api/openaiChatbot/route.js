// src/app/api/openaiChatbot/route.js

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is in the environment variables
});

// Named export for POST method
export async function POST(req) {
  try {
    const { messages } = await req.json(); // Extract the array of messages from the request body

    // Ensure messages is an array and has at least one user message
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Create a chat completion request with the messages
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...messages, // Spread the user messages into the chat request
      ],
      model: "gpt-4o-mini",
    });

    // Log the response for debugging
    console.log(completion.choices[0]);

    // Send the response back to the client
    return new Response(JSON.stringify({ response: completion.choices[0].message.content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error in OpenAI API:", error);
    return new Response(JSON.stringify({ error: 'Failed to process your request.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

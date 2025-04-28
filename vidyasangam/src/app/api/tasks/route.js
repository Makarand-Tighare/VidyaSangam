import { NextResponse } from 'next/server';

// Mock database for tasks (in a real application, this would be a database)
let tasks = {};

export async function GET(request) {
  try {
    // Get the registration number from the URL
    const url = new URL(request.url);
    const regNo = url.searchParams.get('regNo');
    
    if (!regNo) {
      return NextResponse.json({ error: 'Registration number is required' }, { status: 400 });
    }
    
    // Return tasks for the specified registration number
    return NextResponse.json({ 
      tasks: tasks[regNo] || [] 
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { menteeId, taskPrompt, taskDescription } = body;
    
    if (!menteeId || !taskPrompt) {
      return NextResponse.json({ error: 'Mentee ID and task prompt are required' }, { status: 400 });
    }
    
    // Create a new task
    const newTask = {
      id: Date.now(),
      title: taskPrompt,
      description: taskDescription || '',
      total_marks: 10,
      created_at: new Date().toISOString(),
      questions: generateMockQuestions(taskPrompt, 10)
    };
    
    // Add the task to the mock database
    if (!tasks[menteeId]) {
      tasks[menteeId] = [];
    }
    
    tasks[menteeId].push(newTask);
    
    return NextResponse.json({ 
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate mock questions
function generateMockQuestions(topic, count = 10) {
  const questions = [];
  
  for (let i = 1; i <= count; i++) {
    questions.push({
      id: i,
      question: `Question ${i} about ${topic}?`,
      options: [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`,
      ],
      answer: Math.floor(Math.random() * 4) // Random correct answer index
    });
  }
  
  return questions;
} 
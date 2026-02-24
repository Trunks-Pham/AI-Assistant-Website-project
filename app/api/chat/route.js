export async function POST(request) {
  try {
    const { message } = await request.json();

    // Validate input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:2301/v1';
    const authToken = process.env.LM_STUDIO_TOKEN || 'TOKEN_HERE';

    // Call LM Studio API
    const response = await fetch(`${lmStudioUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.',
          },
          {
            role: 'user',
            content: message.trim(),
          },
        ],
        temperature: 0.7,
      }),
    });

    // Handle connection errors
    if (!response.ok) {
      if (response.status === 503 || response.status === 500) {
        return Response.json(
          { error: 'LM Studio is offline or not responding. Please ensure it is running at http://localhost:2301/v1' },
          { status: 503 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the assistant message
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return Response.json(
        { error: 'Invalid response from LM Studio' },
        { status: 500 }
      );
    }

    const assistantMessage = data.choices[0].message.content;

    return Response.json({
      content: assistantMessage,
    });
  } catch (error) {
    console.error('[Chat API Error]', error);

    // Check if it's a network error (LM Studio offline)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return Response.json(
        { error: 'Unable to connect to LM Studio. Please ensure it is running at http://localhost:2301/v1' },
        { status: 503 }
      );
    }

    return Response.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

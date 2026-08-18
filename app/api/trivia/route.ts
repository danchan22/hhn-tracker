import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { category, difficulty } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable.' }, { status: 500 });
    }

    const prompt = `Generate 5 unique ${difficulty || 'Medium'} horror movie trivia questions about ${category || 'Horror Movie History'}.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: "You are a trivia generator. Respond ONLY with a JSON array containing 5 trivia objects. Do not use Markdown blocks." }]
        },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING' },
                options: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                },
                correctAnswer: { type: 'STRING' },
                funFact: { type: 'STRING' }
              },
              required: ['question', 'options', 'correctAnswer', 'funFact']
            }
          },
          maxOutputTokens: 1500,
          temperature: 0.3
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json({ error: errData.error?.message || 'Gemini API Error' }, { status: res.status });
    }

    const data = await res.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Received empty response from Gemini.');
    }

    rawText = rawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    const parsedTriviaArray = JSON.parse(rawText);
    return NextResponse.json(parsedTriviaArray);

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate trivia.' }, { status: 500 });
  }
}

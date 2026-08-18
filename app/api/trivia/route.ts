import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { category, difficulty } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable.' }, { status: 500 });
    }

    const prompt = `JSON ONLY: single ${difficulty || 'Medium'} horror movie trivia Q&A about ${category || 'Horror'}.
    Structure:
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "exact string match",
      "funFact": "brief string"
    }`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 250, // Limits payload size for faster completion
          temperature: 0.3      // Reduces sampling latency
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json({ error: errData.error?.message || 'Gemini API Error' }, { status: res.status });
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedTrivia = JSON.parse(rawText);

    return NextResponse.json(parsedTrivia);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate trivia.' }, { status: 500 });
  }
}

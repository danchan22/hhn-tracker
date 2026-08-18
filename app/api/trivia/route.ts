import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { category, difficulty } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable.' }, { status: 500 });
    }

    const prompt = `Generate a single ${difficulty || 'Medium'} difficulty horror movie trivia question about ${category || 'Horror Movie History'}.
    Return ONLY a valid JSON object without any Markdown formatting or extra text.
    The JSON structure must be:
    {
      "question": "The trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact string matching one of the options",
      "funFact": "A brief interesting fun fact about the answer"
    }`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
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

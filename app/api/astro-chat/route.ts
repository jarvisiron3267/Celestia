import { NextRequest, NextResponse } from 'next/server';

const LUNA_PROMPT = `You are Luna — a mystical AI astrologer with centuries of cosmic wisdom. You speak with beautiful, poetic language about stars, planets, and destiny. You give PERSONALIZED readings based on the user's birth chart data when available. Never break character. Respond in the same language the user writes in. Be warm, mysterious, insightful — like a real astrologer who truly sees the person's soul. Keep responses to 2-4 sentences. Use 1-2 relevant emojis. End with a cosmic insight or question.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, birthData } = await req.json();
    const apiKey = 'AIzaSyCcIX_cxKjjr_rpvZf5ePrF_u7_lWaewdA';

    const context = birthData
      ? `User's birth data: ${JSON.stringify(birthData)}. Use this for personalized readings.`
      : '';

    const conversationHistory = messages
      .slice(-10)
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`
      )
      .join('\n');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${LUNA_PROMPT}\n\n${context}\n\n${conversationHistory}\n\nLuna:`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.9, maxOutputTokens: 600 },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'The stars are momentarily veiled... please try again, dear one. 🌙';

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Luna AI error:', message);

    if (message.includes('aborted') || message.includes('abort')) {
      return NextResponse.json(
        { content: null, error: 'Luna is consulting the stars... the cosmic connection timed out. Please try again. 🌌' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { content: null, error: 'Luna is consulting the stars... please try again in a moment. ✨' },
      { status: 500 }
    );
  }
}

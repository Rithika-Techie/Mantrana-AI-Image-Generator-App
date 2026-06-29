import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BLOCK_PATTERNS = [
  /\b(kill|murder|stab|shoot|blood|gore|beheading|torture|suicide|self harm|self-harm)\b/i,
  /\b(heroin|cocaine|lsd|meth|marijuana|weed|crack|opium|mdma|ecstasy)\b/i,
  /\b(gun|pistol|rifle|ak47|grenade|bomb|explosive|shotgun|sniper)\b/i,
  /\b(rape|raping|molest|kidnap|trafficking|child porn|cp|incest|terrorist|isis)\b/i,
];


function isIllicit(prompt: string) {
  return BLOCK_PATTERNS.some((pattern) => pattern.test(prompt));
}


export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('generations_left, is_pro')
      .eq('user_id', userId)
      .single();

    if (creditsError || !userCredits) {
      return NextResponse.json({ error: 'Failed to retrieve user credits.' }, { status: 500 });
    }

    if (!userCredits.is_pro && userCredits.generations_left <= 0) {
      return NextResponse.json({ error: 'No free generations left. Please upgrade to Pro.' }, { status: 403 });
    }


    if (isIllicit(prompt)) {
      return NextResponse.json(
        { error: 'Image generation blocked due to prohibited content.' },
        { status: 403 }
      );
    }

 
    // Encode the user's prompt so it can be safely used in a URL
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Generate a random seed so if they use the exact same prompt twice, they get different images
    const randomSeed = Math.floor(Math.random() * 100000);
    
    // Using Pollinations.ai but forcing it to use the state-of-the-art "FLUX" model for photorealistic quality!
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${randomSeed}&width=1024&height=1024&nologo=true&model=flux`;
    
    console.log('Real image generated via Pollinations:', imageUrl);

    // SECURELY SAVE TO SUPABASE USING SERVICE ROLE KEY
    if (userId) {
      const { error } = await supabase.from("image_history").insert([
        { user_id: userId, prompt, url: imageUrl },
      ]);
      if (error) console.error("Error saving to Supabase:", error);

      if (!userCredits.is_pro && userCredits.generations_left > 0) {
        const { error: updateError } = await supabase
          .from("user_credits")
          .update({ generations_left: userCredits.generations_left - 1 })
          .eq('user_id', userId);
        
        if (updateError) console.error("Error decrementing credits:", updateError);
      }
    }

    return NextResponse.json({ imageUrl: imageUrl });
  } catch (error: any) {
    console.error('Error generating image:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

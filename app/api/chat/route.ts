import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '',
});

console.log("OpenRouter API Key present:", !!process.env.OPENROUTER_API_KEY);

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        const query = (message || "").toLowerCase();

        // 0. Query Translation / Keyword Extraction
        let searchTerms = [query];

        if (process.env.OPENROUTER_API_KEY) {
            try {
                const translationCompletion = await openai.chat.completions.create({
                    model: "xiaomi/mimo-v2-flash:free",
                    messages: [
                        { role: "system", content: "You are a grocery search assistant. Translate the user query into English keywords for a database search. Return ONLY a JSON array of strings. Example: query='daging', output=['beef', 'meat', 'steak']. Example: query='apel', output=['apple']." },
                        { role: "user", content: message }
                    ],
                    response_format: { type: "json_object" }
                });

                const translationText = translationCompletion.choices[0].message.content || "{}";
                const translationJson = JSON.parse(translationText);

                // Assuming output structure like { "keywords": ["..."] } or just the array if the model is smart
                // Let's force a structure in the prompt or handle loose JSON better.
                // Re-prompting stricter:
                // Actually, let's just search.
                const keywords = translationJson.keywords || translationJson.items || [];
                if (Array.isArray(keywords) && keywords.length > 0) {
                    searchTerms = keywords;
                }
            } catch (e) {
                console.error("Translation failed, falling back to original query", e);
            }
        }

        // 1. Context Retrieval (RAG) using translated terms
        // We'll search for the first term or join them. Ideally OR query.
        // For simplicity, let's search the first converted keyword if available, or just use the first one.
        // Or build an OR query: .or(`title.ilike.%${term1}%,title.ilike.%${term2}%`)

        const searchTerm = searchTerms[0] || query; // fallback

        // Search Recipes
        const { data: recipes } = await supabase
            .from('recipes')
            .select(`
                id,
                title,
                prep_time_minutes,
                recipe_ingredients (
                    products (
                        id,
                        name,
                        price,
                        image_url
                    )
                )
            `)
            .ilike('title', `%${searchTerm}%`)
            .limit(2);

        // Search Products
        const { data: products } = await supabase
            .from('products')
            .select('id, name, price, stock_quantity, image_url')
            .ilike('name', `%${searchTerm}%`)
            .limit(5);

        // 2. OpenRouter Integration
        if (process.env.OPENROUTER_API_KEY) {
            const context = {
                foundRecipes: recipes || [],
                foundProducts: products || []
            };

            const historyMessages = history
                ? history.map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
                : [];

            const systemPrompt = `
            You are the AI Concierge for CulinaMarket, a premium grocery store.
            Your goal is to help users find recipes and products from our inventory.
            
            Context found in database for current query:
            ${JSON.stringify(context, null, 2)}
            
            Instructions:
            1. Analyze the Context and User Query.
            2. **ABSOLUTE RULE**: You are an interface for the provided database. You generally CANNOT recommend things that are not in the "Context" JSON below.
            3. **DATA VALIDATION**: 
               - If the "Context" lists recipes or products, you may recommend them. 
               - The 'action.items' array must ONLY contain items with matching 'id', 'name', 'price' and 'image_url' from the Context. DO NOT MAKE UP IDS.
            4. **MISSING DATA**: 
               - If the Context is empty (foundRecipes: [], foundProducts: []), you **MUST NOT** pretend to have the item.
               - Instead, politely say: "I apologize, but we don't have [item] in stock right now."
            5. Your tone should be helpful, premium, and concise.
            6. **LANGUAGE**: Answer in the same language as the User's Query. If they ask in Indonesian, answer in Indonesian.
            
            IMPORTANT: You must return a strict JSON object. No markdown formatting.
            Structure:
            {
                "text": "Response message.",
                "action": {
                    "type": "add_to_cart",
                    "items": [
                        { "id": "must_match_context_id", "name": "must_match_context_name", "price": 123, "image_url": "must_match_context_image_url" }
                    ]
                }
            }
            Only include "action" if you are recommending specific items explicitly found in the Context.
            `;

            try {
                const completion = await openai.chat.completions.create({
                    model: "xiaomi/mimo-v2-flash:free",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...historyMessages,
                        { role: "user", content: message }
                    ],
                    response_format: { type: "json_object" }
                });

                const text = completion.choices[0].message.content || "{}";

                const jsonResponse = JSON.parse(text);
                return NextResponse.json({ role: 'ai', ...jsonResponse });

            } catch (aiError: any) {
                console.error("OpenRouter Error:", aiError);
            }
        } else {
            // Specific message so user knows Key is missing
            return NextResponse.json({
                role: 'ai',
                text: "I'm currently offline because my OpenRouter API key is missing. Please check your .env.local file and ensure OPENROUTER_API_KEY is set correctly."
            });
        }

        // 3. Fallback Logic (Keywords) if no API Key or AI Error
        if (recipes && recipes.length > 0) {
            const recipe = recipes[0];
            const products = recipe.recipe_ingredients
                ? recipe.recipe_ingredients.map((ri: any) => ri.products).filter(Boolean)
                : [];

            return NextResponse.json({
                role: 'ai',
                text: `I found a recipe: "${recipe.title}". It takes ${recipe.prep_time_minutes} mins. Added ingredients to your recommended cart.`,
                action: {
                    type: 'add_to_cart',
                    items: products
                }
            });
        }

        if (products && products.length > 0) {
            return NextResponse.json({
                role: 'ai',
                text: `I found these items matching "${query}".`,
                action: {
                    type: 'add_to_cart',
                    items: products
                }
            });
        }

        return NextResponse.json({
            role: 'ai',
            text: "I apologize, but I couldn't find that specific item in our inventory right now. However, feel free to browse our wide selection of fresh ingredients like Pasta or Salmon!"
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

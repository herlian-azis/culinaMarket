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
        // Fallback Indonesian-English dictionary for common food terms
        const foodDictionary: { [key: string]: string[] } = {
            'ayam': ['chicken', 'ayam'],
            'daging': ['beef', 'meat', 'daging'],
            'ikan': ['fish', 'salmon', 'ikan'],
            'telur': ['egg', 'eggs', 'telur'],
            'nasi': ['rice', 'nasi'],
            'pasta': ['pasta', 'spaghetti'],
            'sayur': ['vegetable', 'spinach', 'sayur'],
            'buah': ['fruit', 'banana', 'buah'],
            'salmon': ['salmon'],
            'pisang': ['banana', 'pisang'],
            'alpukat': ['avocado', 'alpukat'],
            'bawang': ['garlic', 'onion', 'bawang'],
            'tomat': ['tomato', 'tomat'],
        };

        // Check dictionary first for instant translation
        let searchTerms: string[] = [];
        const queryWords = query.split(/\s+/);
        for (const word of queryWords) {
            if (foodDictionary[word]) {
                searchTerms.push(...foodDictionary[word]);
            }
        }

        // If no dictionary match, try AI translation
        if (searchTerms.length === 0 && process.env.OPENROUTER_API_KEY) {
            try {
                const translationCompletion = await openai.chat.completions.create({
                    model: "xiaomi/mimo-v2-flash:free",
                    messages: [
                        { role: "system", content: "You are a grocery/food translator. Extract food-related keywords from the user query and translate them to English. Return JSON: {\"keywords\": [\"english_word1\", \"english_word2\"]}. Example: 'resep ayam goreng' -> {\"keywords\": [\"chicken\", \"fried\", \"recipe\"]}. Example: 'makan malam sehat' -> {\"keywords\": [\"dinner\", \"healthy\", \"meal\"]}." },
                        { role: "user", content: message }
                    ],
                    response_format: { type: "json_object" }
                });

                const translationText = translationCompletion.choices[0].message.content || "{}";
                const translationJson = JSON.parse(translationText);
                const keywords = translationJson.keywords || translationJson.items || [];
                if (Array.isArray(keywords) && keywords.length > 0) {
                    searchTerms = keywords.map((k: string) => k.toLowerCase());
                }
            } catch (e) {
                console.error("Translation failed, falling back to original query", e);
            }
        }

        // Always include original query as fallback
        if (searchTerms.length === 0) {
            searchTerms = [query];
        }

        console.log("Search terms:", searchTerms);

        // 1. Context Retrieval (RAG) using translated terms
        // We'll search for the first term or join them. Ideally OR query.
        // For simplicity, let's search the first converted keyword if available, or just use the first one.
        // Or build an OR query: .or(`title.ilike.%${term1}%,title.ilike.%${term2}%`)

        const searchTerm = searchTerms[0] || query; // fallback

        // Helper to construct OR query for Supabase
        const buildOrQuery = (columns: string[], terms: string[]) => {
            return terms.flatMap(term => columns.map(col => `${col}.ilike.%${term}%`)).join(',');
        };

        // Detect if user is asking specifically about RECIPES
        const recipeKeywords = ['resep', 'recipe', 'masak', 'cook', 'bikin', 'buat makanan', 'menu', 'hidangan'];
        const isRecipeQuery = recipeKeywords.some(keyword => query.includes(keyword));

        // Detect if user is asking for general suggestions (like "saran resep", "recommend dinner")
        const generalSuggestionKeywords = ['saran', 'suggest', 'recommend', 'ide', 'idea', 'apa yang', 'what should'];
        const isGeneralSuggestion = generalSuggestionKeywords.some(keyword => query.includes(keyword));

        // Combined: Is this a recipe-related request?
        const isRecipeRequest = isRecipeQuery || (isGeneralSuggestion && isRecipeQuery);

        // Is this a product-only query? (asking "ada ayam?" without "resep")
        const isProductQuery = !isRecipeQuery;

        console.log("Query analysis:", { isRecipeQuery, isProductQuery, isGeneralSuggestion });

        const termsToSearch = searchTerms.length > 0 ? searchTerms : [query];

        // 1. Search Recipes by Title or Description (or get all for general requests)
        let recipesByTitle: any[] | null = null;

        if (isRecipeQuery) {
            // For general requests, fetch all available recipes
            // First try a simple query to check connectivity
            console.log("Fetching all recipes (general request) with searchTerms:", searchTerms);

            const { data: simpleData, error: simpleError } = await supabase
                .from('recipes')
                .select('id, title, prep_time_minutes')
                .limit(10);

            console.log("Simple recipe fetch count:", simpleData?.length || 0);
            if (simpleError) console.error("Simple recipe error:", simpleError);

            // Now fetch with full relations
            const { data, error } = await supabase
                .from('recipes')
                .select(`
                    id,
                    title,
                    prep_time_minutes,
                    recipe_ingredients (
                        products!recipe_ingredients_product_id_fkey (
                            id,
                            name,
                            price,
                            image_url
                        )
                    )
                `)
                .limit(10);

            console.log("Full recipe request - data count:", data?.length || 0);
            if (error) console.error("General recipe request - error:", error);
            recipesByTitle = data;
        } else {
            // For specific queries, search by title/description
            const orQuery = buildOrQuery(['title', 'description'], termsToSearch);
            console.log("Specific query OR condition:", orQuery);

            const { data, error } = await supabase
                .from('recipes')
                .select(`
                    id,
                    title,
                    prep_time_minutes,
                    recipe_ingredients (
                        products!recipe_ingredients_product_id_fkey (
                            id,
                            name,
                            price,
                            image_url
                        )
                    )
                `)
                .or(orQuery)
                .limit(5);

            console.log("Specific recipe search - data:", JSON.stringify(data, null, 2));
            if (error) console.error("Specific recipe search - error:", error);
            recipesByTitle = data;
        }

        // 2. Search Products by Name or Category
        const { data: productsByName } = await supabase
            .from('products')
            .select('id, name, price, stock_quantity, image_url')
            .or(buildOrQuery(['name', 'category'], termsToSearch))
            .limit(10);

        // 3. Search Recipes by Ingredient (if we found matching products)
        let recipesByIngredient: any[] = [];
        if (productsByName && productsByName.length > 0) {
            const productIds = productsByName.map(p => p.id);
            // Find recipe_ingredients that contain these products
            const { data: relatedRecipeIngredients } = await supabase
                .from('recipe_ingredients')
                .select('recipe_id')
                .in('product_id', productIds)
                .limit(20);

            if (relatedRecipeIngredients && relatedRecipeIngredients.length > 0) {
                const recipeIds = Array.from(new Set(relatedRecipeIngredients.map(r => r.recipe_id)));
                const { data: fetchedRecipes } = await supabase
                    .from('recipes')
                    .select(`
                        id,
                        title,
                        prep_time_minutes,
                        recipe_ingredients (
                            products!recipe_ingredients_product_id_fkey (
                                id,
                                name,
                                price,
                                image_url
                            )
                        )
                    `)
                    .in('id', recipeIds)
                    .limit(5);

                if (fetchedRecipes) recipesByIngredient = fetchedRecipes;
            }
        }

        // Merge and Deduplicate Recipes
        const allRecipes = [...(recipesByTitle || []), ...recipesByIngredient];
        const uniqueRecipesMap = new Map();
        allRecipes.forEach(r => uniqueRecipesMap.set(r.id, r));
        const recipes = Array.from(uniqueRecipesMap.values());

        const products = productsByName || [];

        // 2. OpenRouter Integration
        if (process.env.OPENROUTER_API_KEY) {
            const context = {
                foundRecipes: recipes || [],
                foundProducts: products || []
            };

            const historyMessages = history
                ? history.map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
                : [];

            // Format recipes for clearer AI understanding WITH FULL ingredient details
            const formattedRecipes = recipes.map(r => ({
                id: r.id,
                title: r.title,
                prep_time_minutes: r.prep_time_minutes,
                ingredients: r.recipe_ingredients?.map((ri: any) => ri.products).filter(Boolean) || []
            }));

            // Create a clear list of all ingredients per recipe for the AI
            const recipeListWithIngredients = formattedRecipes.map(r => {
                const ingredientsList = r.ingredients.map((i: any) =>
                    `  * ${i.name} - Rp ${i.price} (ID: ${i.id})`
                ).join('\n');
                return `RECIPE: "${r.title}" (${r.prep_time_minutes} mins)\nINGREDIENTS:\n${ingredientsList || '  (no ingredients linked)'}`;
            }).join('\n\n');

            // Determine query type for the AI
            const queryType = isRecipeQuery ? 'RECIPE' : 'PRODUCT';

            const systemPrompt = `
            You are the AI Concierge for CulinaMarket, a premium grocery store.
            
            ===== QUERY TYPE DETECTED: ${queryType} =====
            ${isRecipeQuery
                    ? 'The user is asking about RECIPES. Recommend recipes with ALL their ingredients.'
                    : 'The user is asking about PRODUCTS/INGREDIENTS. List available products that match their query.'}
            
            ===== DATABASE RECIPES WITH ALL INGREDIENTS =====
            ${recipeListWithIngredients || 'No recipes found.'}
            
            ===== AVAILABLE PRODUCTS =====
            ${products.length > 0 ? products.map(p => `- ${p.name} (Rp ${p.price}, ID: ${p.id}, image: ${p.image_url})`).join('\n') : 'No products found.'}
            
            ===== CRITICAL INSTRUCTIONS =====
            ${isRecipeQuery ? `
            1. **RECIPE MODE**: The user asked about recipes. Recommend a RECIPE and include ALL its ingredients.
            2. **ALL INGREDIENTS**: Include EVERY ingredient in action.items. Do NOT skip any!
            3. Use the exact id, name, price, image_url from the context.
            ` : `
            1. **PRODUCT MODE**: The user asked about products/ingredients (e.g., "ada ayam?", "apakah ada telur?").
            2. **SHOW PRODUCTS**: List the matching products from AVAILABLE PRODUCTS section.
            3. Do NOT recommend recipes unless the user explicitly asks for recipes.
            4. Include matching products in action.items.
            `}
            4. **LANGUAGE**: Answer in the user's language (Indonesian/English).
            5. **NO INVENTION**: Never make up products or IDs not in the database.
            
            ===== RAW CONTEXT DATA (USE THESE EXACT VALUES) =====
            ${JSON.stringify(context, null, 2)}
            
            ===== RESPONSE FORMAT (JSON ONLY) =====
            ${isRecipeQuery ? `
            For RECIPE queries, include ALL ingredients:
            {
                "text": "Saya rekomendasikan resep [Recipe Name]! [brief description]. Berikut semua bahan yang Anda butuhkan:",
                "action": {
                    "type": "add_to_cart",
                    "items": [ALL ingredients from the recipe]
                }
            }
            ` : `
            For PRODUCT queries, list matching products:
            {
                "text": "Ya, kami punya [product name]! [brief description about the product].",
                "action": {
                    "type": "add_to_cart",
                    "items": [
                        { "id": "product_id", "name": "product_name", "price": 45000, "image_url": "url" }
                    ]
                }
            }
            `}
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

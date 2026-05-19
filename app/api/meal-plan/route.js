import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchPexelsImage(query) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );
    const data = await res.json();
    return data.photos?.[0]?.src?.medium || null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { meals, people, days, cuisines, restrictions, cookingTime, ingredients } = body;

    const mealsStr = Array.isArray(meals) ? meals.join(', ') : meals;
    const cuisinesStr = Array.isArray(cuisines) ? cuisines.join(', ') : cuisines;

    const prompt = `You are a fun, witty meal planning assistant with a great sense of humor. Create a meal plan based on these preferences:
- Meals to plan: ${mealsStr}
- Number of people: ${people}
- Number of days: ${days}
- Cuisines/foods they like: ${cuisinesStr}
- Dietary restrictions: ${restrictions || 'none'}
- Ingredients to use up: ${ingredients || 'none'}
- Time willing to spend cooking per meal: ${cookingTime}

Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just raw JSON.

The JSON must follow this exact structure:
{
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "Dinner",
          "funName": "A short, witty fun name for the meal (e.g. 'Panic Noodles', 'Main Character Salmon')",
          "realName": "The actual meal name (e.g. 'Lemon Herb Salmon with Rice')",
          "description": "One funny, relatable sentence about this meal",
          "cookTime": "e.g. 25 min",
          "imageSearch": "A 2-3 word search term for a beautiful, appetizing food photo — be specific and descriptive (e.g. 'creamy scrambled eggs', 'spaghetti carbonara plate', 'grilled salmon fillet') not just the main ingredient",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "steps": ["Step 1", "Step 2"]
        }
      ]
    }
  ],
  "groceryList": {
    "Produce": ["item 1", "item 2"],
    "Protein": ["item 1"],
    "Dairy": ["item 1"],
    "Pantry": ["item 1"],
    "Other": ["item 1"]
  }
}

Only include the meal types requested (${mealsStr}). Make the funName and description genuinely funny and relatable — think "adulting is hard" energy. Keep descriptions to one sentence max.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const parsed = JSON.parse(text);

    // Fetch images sequentially with a small delay to avoid rate limits
    for (const day of parsed.days) {
      for (const meal of day.meals) {
        const query = meal.imageSearch || meal.realName;
        meal.imageUrl = await fetchPexelsImage(query);
        await sleep(300);
      }
    }

    return Response.json({ mealPlan: parsed });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
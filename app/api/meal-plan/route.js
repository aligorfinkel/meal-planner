import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
          "imageSearch": "A simple 1-2 word search term for a food photo (e.g. 'salmon', 'pasta', 'tacos')",
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

    try {
      const parsed = JSON.parse(text);
      return Response.json({ mealPlan: parsed });
    } catch {
      return Response.json({ error: "Failed to parse meal plan", raw: text }, { status: 500 });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
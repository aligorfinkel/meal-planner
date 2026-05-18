import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  const body = await request.json();

  const {
    meals,
    people,
    days,
    cuisines,
    restrictions,
    favorites,
    cookingTime,
  } = body;

  const prompt = `You are a helpful meal planning assistant. Create a detailed meal plan based on the following preferences:

- Meals to plan: ${meals}
- Number of people: ${people}
- Number of days: ${days}
- Cuisines/foods they like: ${cuisines}
- Dietary restrictions: ${restrictions}
- Favorite meals to include: ${favorites}
- Time willing to spend cooking per meal: ${cookingTime}

Please provide a day-by-day meal plan. For each day, list the requested meals. For each meal, include:
1. The meal name
2. A full recipe with ingredients (scaled for ${people} people) and step-by-step instructions

End with a complete grocery list for all days combined, organized by category (produce, protein, dairy, pantry, etc).

Format your response clearly with each day as a header, meals underneath, and the grocery list at the end.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return Response.json({
    mealPlan: message.content[0].text,
  });
}
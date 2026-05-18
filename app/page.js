'use client';

import { useState } from 'react';

const cuisineOptions = [
  'Italian', 'Mexican', 'Mediterranean', 'American', 'Indian',
  'Japanese', 'Thai', 'Chinese', 'Greek', 'Korean',
  'French', 'Spanish', 'Caribbean', 'Vietnamese'
];

const loadingMessages = [
  "Chopping vegetables... 🔪",
  "Figuring out dinner so you don't have to... 🛒",
  "Almost there, you're doing great... ✨",
  "This is what adulting looks like... 🥦",
  "Consulting the chef... 👨‍🍳",
];

export default function Home() {
  const [form, setForm] = useState({
    meals: [],
    days: '',
    people: '',
    cookingTime: '',
    cuisines: [],
    otherCuisine: '',
    restrictions: '',
    ingredients: '',
  });

  const [mealPlan, setMealPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  const toggleItem = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 2500);

    const res = await fetch('/api/meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cuisines: [...form.cuisines, form.otherCuisine].filter(Boolean).join(', '),
      }),
    });
    const data = await res.json();
    clearInterval(interval);
    setMealPlan(data.mealPlan);
    setLoading(false);
  };

  const ButtonGroup = ({ field, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggleItem(field, opt)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            form[field].includes(opt)
              ? 'bg-rose-400 text-white border-rose-400'
              : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const SingleSelect = ({ field, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => setForm(prev => ({ ...prev, [field]: opt }))}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            form[field] === opt
              ? 'bg-rose-400 text-white border-rose-400'
              : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🍳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Building your meal plan...</h2>
          <p className="text-rose-400 text-lg font-medium">{loadingMessage}</p>
        </div>
      </main>
    );
  }

  if (mealPlan) {
    return (
      <main className="min-h-screen bg-rose-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Carrot</h1>          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🍽️ Your Meal Plan</h2>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
              {mealPlan}
            </div>
            <button
              onClick={() => setMealPlan('')}
              className="mt-8 px-6 py-3 bg-rose-400 text-white rounded-lg font-medium hover:bg-rose-500 transition-all"
            >
              Plan another week
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
          Carrot          </h1>
          <p className="text-gray-400 text-sm mt-1">Because adulting is hard."</p>
          <p className="text-gray-500 text-base mt-2">Your weekly meals, sorted.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">

          <div>
            <label className="block text-gray-800 font-semibold mb-3">Which meals do you want planned?</label>
            <ButtonGroup field="meals" options={['Breakfast', 'Lunch', 'Dinner', 'Snacks']} />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">How many days?</label>
            <SingleSelect field="days" options={['3', '5', '7']} />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">How many people are you feeding?</label>
            <SingleSelect field="people" options={['1', '2', '3', '4', '5+']} />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">How long do you want to spend cooking per meal?</label>
            <input
              type="text"
              placeholder="e.g. 30 minutes, 1 hour..."
              value={form.cookingTime}
              onChange={e => setForm(prev => ({ ...prev, cookingTime: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-rose-300"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">What cuisines do you like?</label>
            <ButtonGroup field="cuisines" options={cuisineOptions} />
            <input
              type="text"
              placeholder="Other (type your own)..."
              value={form.otherCuisine}
              onChange={e => setForm(prev => ({ ...prev, otherCuisine: e.target.value }))}
              className="mt-3 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-rose-300"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Any dietary restrictions or allergies? <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. gluten-free, nut allergy, no shellfish..."
              value={form.restrictions}
              onChange={e => setForm(prev => ({ ...prev, restrictions: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-rose-300"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Any ingredients you want to use up? <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. chicken thighs, half a bag of lentils..."
              value={form.ingredients}
              onChange={e => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-rose-300"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-rose-400 text-white rounded-lg font-semibold text-lg hover:bg-rose-500 transition-all"
          >
            Let's prep 🍴
          </button>

        </div>
      </div>
    </main>
  );
}
'use client';

import { useState, useEffect } from 'react';

const cuisineOptions = [
  'Italian', 'Mexican', 'Mediterranean', 'American', 'Indian',
  'Japanese', 'Thai', 'Chinese', 'Greek', 'Korean',
  'French', 'Spanish', 'Caribbean', 'Vietnamese'
];

const loadingMessages = [
  "Chopping vegetables so you don't have to... 🥦",
  "Figuring out dinner, one crisis at a time... 🤔",
  "Almost there, you're doing great... ✨",
  "Consulting the fridge oracle... 🔮",
  "Making adulting slightly less terrible... 🥄",
];

const mealEmojis = { Breakfast: '☀️', Lunch: '🥪', Dinner: '🍝', Snacks: '🧃' };

function MealCard({ meal, cardKey, expandedMeal, setExpandedMeal }) {
  const [imgUrl, setImgUrl] = useState('');
  const isExpanded = expandedMeal === cardKey;

  useEffect(() => {
    const query = meal.imageSearch || meal.realName;
    fetch(`/api/image?query=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => { if (data.url) setImgUrl(data.url); });
  }, [meal.imageSearch, meal.realName]);

  return (
    <div className="meal-card">
      <div className="meal-card-img" style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}}>
        <div className="meal-type-tag">{mealEmojis[meal.type] || '🍽️'} {meal.type}</div>
      </div>
      <div className="meal-card-body">
        <h3 className="meal-fun-name">{meal.realName}</h3>
        <p className="meal-description">{meal.description}</p>
        <div className="meal-meta">
          <span className="time-tag">⏱ {meal.cookTime}</span>
        </div>
        <button
          onClick={() => setExpandedMeal(isExpanded ? null : cardKey)}
          className="recipe-toggle"
        >
          {isExpanded ? 'Hide recipe ↑' : 'See recipe ↓'}
        </button>
        {isExpanded && (
          <div className="recipe-details">
            <div className="mb-3">
              <p className="recipe-section-title">Ingredients</p>
              <ul className="recipe-list">
                {meal.ingredients.map((ing, ii) => (
                  <li key={ii}>• {ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="recipe-section-title">Steps</p>
              <ol className="recipe-list">
                {meal.steps.map((step, si) => (
                  <li key={si}>{si + 1}. {step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [expandedMeal, setExpandedMeal] = useState(null);

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
        cuisines: [...form.cuisines, form.otherCuisine].filter(Boolean),
      }),
    });
    const data = await res.json();
    clearInterval(interval);
    setMealPlan(data.mealPlan);
    setLoading(false);
  };

  const MultiSelect = ({ field, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggleItem(field, opt)}
          className={`pill-btn ${form[field].includes(opt) ? 'pill-btn-active' : 'pill-btn-inactive'}`}
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
          className={`pill-btn ${form[field] === opt ? 'pill-btn-active' : 'pill-btn-inactive'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-screen carrot-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold heading-dark mb-3" style={{fontFamily: "'Fraunces', serif"}}>
            Building your meal plan... 🍳
          </h2>
          <p className="text-pink-500 text-lg">{loadingMessage}</p>
        </div>
      </main>
    );
  }

  // Results screen
  if (mealPlan) {
    return (
      <main className="min-h-screen carrot-bg">
        {/* Header */}
        <div className="text-center pt-12 pb-6 px-4">
          <div className="carrot-logo mb-2">🥕 carrot</div>
          <p className="veggie-banner mx-auto">
            🎉 You remembered to eat a vegetable this week. We&apos;re proud of you.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-16">

          {/* Weekly Grid */}
          <h2 className="results-heading mb-4">This Week&apos;s Vibe</h2>
          <div className="weekly-grid mb-12">
            {mealPlan.days.map((day, i) => (
              <div key={i} className="day-card">
                <div className="day-emoji">{mealEmojis[day.meals[0]?.type] || '🍽️'}</div>
                <div className="day-meal-name">{day.meals[0]?.funName || day.meals[0]?.realName}</div>
              </div>
            ))}
          </div>

          {/* Meal Cards */}
          {mealPlan.days.map((day, di) => (
            <div key={di} className="mb-10">
              <h2 className="results-heading mb-4">Meal {di + 1}</h2>
              <div className="meal-cards-grid">
                {day.meals.map((meal, mi) => (
                  <MealCard
                    key={mi}
                    meal={meal}
                    cardKey={`${di}-${mi}`}
                    expandedMeal={expandedMeal}
                    setExpandedMeal={setExpandedMeal}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Grocery List */}
          <h2 className="results-heading mb-6">🛒 Grocery List</h2>
          <div className="grocery-single-col">
            {Object.entries(mealPlan.groceryList).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} className="grocery-section">
                  <h3 className="grocery-category">{category}</h3>
                  <ul className="grocery-items">
                    {items.map((item, i) => (
                      <li key={i} className="grocery-item">
                        <span className="grocery-checkbox"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={() => setMealPlan(null)} className="cta-btn">
              Plan another week
            </button>
          </div>

          <p className="footer-text">Made with 💗 and mild panic by Carrot</p>
        </div>
      </main>
    );
  }

  // Form screen
  return (
    <main className="min-h-screen carrot-bg">

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="carrot-logo hero-logo">🥕 carrot</div>
          <h1 className="hero-headline">
            Adulting is hard. Dinner doesn&apos;t have to be.
          </h1>
          <a href="#form" className="cta-btn mt-6 inline-block">
            Plan This Week
          </a>
        </div>
      </div>

      {/* Form */}
      <div id="form" className="max-w-2xl mx-auto px-4 py-12">
        <div className="form-card">

          <div className="form-section">
            <label className="form-label">Which meals do you want planned?</label>
            <MultiSelect field="meals" options={['Breakfast', 'Lunch', 'Dinner', 'Snacks']} />
          </div>

          <div className="form-section">
            <label className="form-label">How many days?</label>
            <SingleSelect field="days" options={['3', '5', '7']} />
          </div>

          <div className="form-section">
            <label className="form-label">How many people are you feeding?</label>
            <SingleSelect field="people" options={['Just me', '2 people', '3–4 people', '5+ crew']} />
          </div>

          <div className="form-section">
            <label className="form-label">How long do you want to spend cooking?</label>
            <SingleSelect field="cookingTime" options={['15 min', '30 min', '45 min', 'No rush']} />
          </div>

          <div className="form-section">
            <label className="form-label">What cuisines do you like?</label>
            <MultiSelect field="cuisines" options={cuisineOptions} />
            <input
              type="text"
              placeholder="Other (type your own)..."
              value={form.otherCuisine}
              onChange={e => setForm(prev => ({ ...prev, otherCuisine: e.target.value }))}
              className="form-input mt-3"
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              Any dietary restrictions? <span className="optional-label">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. vegetarian, gluten-free, no seafood..."
              value={form.restrictions}
              onChange={e => setForm(prev => ({ ...prev, restrictions: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              Ingredients you want to use up? <span className="optional-label">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. chicken thighs, half a bag of lentils..."
              value={form.ingredients}
              onChange={e => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
              className="form-input"
            />
          </div>

          <button onClick={handleSubmit} className="cta-btn w-full mt-2">
            Let&apos;s prep
          </button>

        </div>
      </div>

      <p className="footer-text">Made with 💗 and mild panic by Carrot</p>
    </main>
  );
}
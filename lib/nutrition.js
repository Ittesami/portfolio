// Nutrition targets and an example eating day for a bulk.
// Pure data and maths, used by the Food tab in the browser and by the weekly planner.
// Values are typical averages per serving (USDA-style figures, rounded); real foods vary,
// so treat every number here as an estimate, not a prescription.

export const FOODS = {
  egg: { name: "Egg", unit: "egg", kcal: 72, p: 6.3, c: 0.4, f: 4.8, label: n => (n === 1 ? "1 egg" : `${n} eggs`) },
  bread: { name: "Bread", unit: "slice", kcal: 80, p: 2.7, c: 15, f: 1, label: n => `${n} slice${n === 1 ? "" : "s"} of bread` },
  paratha: { name: "Paratha", unit: "paratha", kcal: 260, p: 5, c: 36, f: 10, label: n => (n === 1 ? "1 paratha" : `${n} parathas`) },
  roti: { name: "Roti", unit: "roti", kcal: 110, p: 3, c: 18, f: 3, label: n => (n === 1 ? "1 roti" : `${n} rotis`) },
  rice: { name: "Cooked rice", unit: "cup", kcal: 205, p: 4.3, c: 45, f: 0.4, label: n => `${n} cup${n === 1 ? "" : "s"} of rice` },
  chickenCurry: { name: "Chicken curry", unit: "150 g", kcal: 300, p: 30, c: 4, f: 18, label: n => `chicken curry (${150 * n} g)` },
  chickenBreast: { name: "Grilled chicken breast", unit: "150 g", kcal: 250, p: 46, c: 0, f: 5, label: n => `grilled chicken breast (${150 * n} g)` },
  beef: { name: "Beef curry", unit: "120 g", kcal: 300, p: 31, c: 2, f: 18, label: n => `beef curry (${120 * n} g)` },
  mutton: { name: "Mutton curry", unit: "120 g", kcal: 350, p: 30, c: 2, f: 25, label: n => `mutton curry (${120 * n} g)` },
  fish: { name: "Fish curry", unit: "120 g", kcal: 200, p: 24, c: 3, f: 10, label: n => `fish curry (${120 * n} g)` },
  milk: { name: "Whole milk", unit: "glass (250 ml)", kcal: 150, p: 8, c: 12, f: 8, label: n => `${n} glass${n === 1 ? "" : "es"} of milk` },
  yogurt: { name: "Plain yogurt (doi)", unit: "150 g", kcal: 92, p: 5, c: 7, f: 5, label: n => `plain yogurt (${150 * n} g)` },
  banana: { name: "Banana", unit: "banana", kcal: 105, p: 1.3, c: 27, f: 0.4, label: n => (n === 1 ? "1 banana" : `${n} bananas`) },
  apple: { name: "Apple", unit: "apple", kcal: 95, p: 0.5, c: 25, f: 0.3, label: n => (n === 1 ? "1 apple" : `${n} apples`) },
  dates: { name: "Dates", unit: "3 dates", kcal: 66, p: 0.6, c: 18, f: 0, label: n => `${3 * n} dates` },
  mango: { name: "Mango", unit: "cup, sliced", kcal: 99, p: 1.4, c: 25, f: 0.6, label: n => `${n} cup${n === 1 ? "" : "s"} of mango` },
};

// One example day. Swap like for like: any meat for another, rice for roti/paratha/bread.
export const MEAL_PLAN = [
  { time: "08:00", meal: "Breakfast", items: [["egg", 3], ["bread", 2], ["milk", 1], ["banana", 1]], note: "1 paratha works instead of the bread." },
  { time: "13:00", meal: "Lunch", items: [["rice", 2], ["chickenCurry", 1]], note: "Beef, mutton or fish curry are fine swaps." },
  { time: "16:30", meal: "Before the gym", items: [["bread", 2], ["banana", 1], ["dates", 1]], note: "Easy carbs about 1–2 hours before training." },
  { time: "19:00", meal: "After the gym", items: [["milk", 1], ["egg", 1], ["banana", 1]], note: "Protein soon after training helps recovery." },
  { time: "21:00", meal: "Dinner", items: [["rice", 2], ["beef", 1], ["apple", 1]], note: "Grilled chicken breast if you want it leaner." },
  { time: "22:30", meal: "Before bed", items: [["milk", 1]], note: "Slow-digesting protein overnight." },
];

export function itemMacros([key, qty]) {
  const f = FOODS[key];
  return { kcal: f.kcal * qty, p: f.p * qty, c: f.c * qty, f: f.f * qty };
}

export function sumMacros(list) {
  return list.reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 });
}

export const mealMacros = (meal) => sumMacros(meal.items.map(itemMacros));
export const planMacros = () => sumMacros(MEAL_PLAN.map(mealMacros));

export function describeItem([key, qty]) {
  return FOODS[key].label(qty);
}

// Daily targets for gaining weight, from the fitness profile.
//   BMR: Mifflin–St Jeor (male). Activity ×1.55 for ~4 training days a week.
//   Calories: maintenance + 400 (a lean bulk, roughly 0.25–0.5 kg a week).
//   Protein 2 g/kg, fat 25% of calories, carbs the rest.
export function nutritionTargets(profile) {
  const w = Number(profile.weightKg) || 58;
  const h = Number(profile.heightCm) || 175;
  const age = Number(profile.age) || 23;
  const bmr = 10 * w + 6.25 * h - 5 * age + 5;
  const maintenance = bmr * 1.55;
  const kcal = Math.round((maintenance + 400) / 50) * 50;
  const protein = Math.round(w * 2);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
  return { kcal, protein, carbs, fat, maintenance: Math.round(maintenance / 50) * 50, weight: w, age };
}

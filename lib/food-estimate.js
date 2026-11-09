// Rough calories and macros from a meal written in plain words, e.g.
// "2 cup rice with 200 diced chicken breast curry and 1 egg".
// Pure functions, used by the Food tab in the browser. Figures are typical home
// portions (USDA-style values, rounded), so every result is an estimate.
//
// How it reads a meal: it finds the foods it knows (longest name first, so "egg fried
// rice" isn't read as egg + rice), then looks at the words just before each food for an
// amount: a number ("2", "half", "a"), a unit ("cup", "g", "piece", "slice") or a
// vague amount ("a few", "a lot of"). No amount means a typical portion.

// per: what one unit is. g: grams in one unit, so "150g of X" works. def: units in a
// typical portion. kcal/p/c/f: per unit.
const F = (name, aliases, per, g, def, kcal, p, c, f, extra = {}) => ({ name, aliases, per, g, def, kcal, p, c, f, ...extra });

export const FOOD_TABLE = [
  // Rice and grains
  F("Egg fried rice", ["egg fried rice", "fried rice"], "cup", 160, 2, 240, 6, 34, 9),
  F("Khichuri", ["khichuri", "khicuri", "khichdi", "khichri"], "cup", 200, 1.5, 250, 9, 38, 7),
  F("Rice", ["rice", "bhaat", "bhat"], "cup", 160, 2, 205, 4.3, 45, 0.4),
  F("Biryani", ["biryani", "biriyani", "kacchi", "tehari"], "cup", 200, 2, 300, 12, 40, 10),
  F("Polao", ["polao", "pulao", "pilau"], "cup", 180, 2, 260, 5, 42, 8),
  F("Pasta", ["pasta", "spaghetti", "macaroni"], "cup", 140, 2, 200, 7, 40, 1.2),
  F("Noodles", ["noodles", "noodle", "ramen", "chowmein", "chow mein"], "pack", 300, 1, 380, 8, 52, 14),
  // Breads
  F("Bread", ["bread", "toast"], "slice", 30, 2, 80, 2.7, 15, 1),
  F("Naan", ["naan", "nan bread"], "naan", 90, 1, 260, 9, 45, 5),
  F("Paratha", ["paratha", "parata", "porota"], "paratha", 80, 1, 260, 5, 36, 10),
  F("Roti", ["roti", "chapati", "ruti"], "roti", 40, 2, 110, 3, 18, 3),
  F("Pizza", ["pizza"], "slice", 110, 2, 280, 12, 30, 12),
  F("Burger", ["burger"], "burger", 220, 1, 550, 28, 45, 28),
  F("Sandwich", ["chicken sandwich", "sandwich"], "sandwich", 180, 1, 400, 25, 40, 15),
  // Meat, fish, eggs
  F("Chicken drumstick", ["drumstick chicken curry", "drumsticks chicken curry", "chicken drumsticks", "chicken drumstick", "drumstick curry", "drumstick", "leg piece"], "piece", 90, 1, 180, 17, 2, 11),
  F("Chicken wing", ["chicken wing", "wing"], "wing", 35, 4, 100, 9, 1, 7),
  F("Chicken curry", ["chicken breast curry", "chicken curry", "chicken korma", "chicken roast", "chicken tikka", "chicken breast", "chicken"], "100 g", 100, 1.5, 200, 20, 3, 12, { piece: 40 }),
  F("Beef curry", ["beef curry", "beef bhuna", "beef"], "100 g", 100, 1.2, 250, 26, 2, 15, { piece: 40 }),
  F("Mutton curry", ["mutton curry", "mutton", "goat curry", "lamb curry", "lamb"], "100 g", 100, 1.2, 290, 25, 2, 21, { piece: 40 }),
  F("Fish curry", ["fish curry", "fish fry", "fish"], "100 g", 100, 1.2, 170, 20, 3, 8, { piece: 60 }),
  F("Salami", ["salami", "pepperoni"], "slice", 10, 4, 40, 2, 0.3, 3.5),
  F("Sausage", ["sausage"], "sausage", 50, 2, 150, 6, 2, 13),
  F("Egg", ["egg", "omelette", "omelet", "dim"], "egg", 50, 2, 72, 6.3, 0.4, 4.8),
  // Sides
  F("Dal", ["lentil", "daal", "dal", "dahl"], "cup", 200, 0.5, 150, 9, 20, 4),
  F("Mashed potato", ["mashed potatoes", "mashed potato", "aloo bhorta", "alu bhorta", "bhorta", "mash"], "cup", 200, 0.5, 210, 4, 30, 9),
  F("Chips", ["french fries", "fries", "chips"], "portion", 120, 1, 380, 4, 48, 19),
  // Spreads, snacks, sweets
  F("Nutella biscuits", ["nutella biscuit", "nutella cookie"], "biscuit", 14, 3, 70, 1, 9, 3.5),
  F("Biscuits", ["biscuit", "cookie", "cookies"], "biscuit", 10, 4, 45, 0.7, 6.5, 2),
  F("Nutella", ["nutella", "chocolate spread"], "spread (15 g)", 15, 1, 80, 1, 9, 4.5, { perBread: true }),
  F("Peanut butter", ["peanut butter"], "spread (16 g)", 16, 1, 95, 4, 3, 8, { perBread: true }),
  F("Butter", ["butter"], "spread (10 g)", 10, 1, 72, 0, 0, 8, { perBread: true }),
  F("Jam", ["jam"], "spread (15 g)", 15, 1, 40, 0, 10, 0, { perBread: true }),
  // Fruit
  F("Banana", ["banana"], "banana", 120, 1, 105, 1.3, 27, 0.4),
  F("Apple", ["apple"], "apple", 180, 1, 95, 0.5, 25, 0.3),
  F("Dates", ["dates", "khejur"], "date", 8, 3, 22, 0.2, 6, 0),
  F("Mango", ["mango"], "cup", 165, 1, 99, 1.4, 25, 0.6),
  F("Watermelon juice", ["watermelon juice"], "glass", 250, 1, 120, 1.5, 28, 0.5),
  F("Juice", ["orange juice", "mango juice", "juice"], "glass", 250, 1, 115, 1, 27, 0.3),
  F("Watermelon", ["watermelon"], "cup", 150, 2, 46, 0.9, 11, 0.2),
  // Drinks and dairy
  F("Milkshake", ["milkshake", "milk shake", "lassi"], "glass", 300, 1, 300, 10, 45, 9),
  F("Milk", ["milk", "doodh"], "glass", 250, 1, 150, 8, 12, 8),
  F("Yogurt", ["yogurt", "yoghurt", "doi", "curd"], "cup", 150, 1, 92, 5, 7, 5),
  F("Tea with milk", ["milk tea", "cha", "chai", "tea"], "cup", 200, 1, 60, 1.5, 9, 2),
  F("Coffee with milk", ["latte", "coffee"], "cup", 250, 1, 120, 6, 12, 5),
  F("Coke", ["coca cola", "coke", "pepsi", "fanta", "sprite", "soft drink", "soda"], "can", 330, 1, 140, 0, 39, 0),
];

const WORD_NUMBERS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5, quarter: 0.25 };
const UNITS = {
  g: "g", gm: "g", gms: "g", gram: "g", grams: "g", gr: "g", kg: "kg",
  ml: "ml",
  cup: "cup", cups: "cup", plate: "cup", plates: "cup", bowl: "cup", bowls: "cup",
  piece: "piece", pieces: "piece", pc: "piece", pcs: "piece", slice: "slice", slices: "slice",
  glass: "glass", glasses: "glass", can: "glass", cans: "glass", bottle: "glass", tbsp: "spoon", spoon: "spoon", spoons: "spoon",
};

// Every alias, longest first, so the most specific name wins.
const ALIASES = FOOD_TABLE.flatMap((food) => food.aliases.map((alias) => ({ alias, food }))).sort((a, b) => b.alias.length - a.alias.length);

// Lower case, words only, with a space at each end so " alias " always matches whole words.
const normalise = (text) =>
  ` ${String(text)
    .toLowerCase()
    .replace(/(\d)(g|gm|ml|kg)\b/g, "$1 $2")
    .replace(/(\d)\.(\d)/g, "$1d$2") // keep decimals ("1.5 cups") through the next step
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/(\d)d(\d)/g, "$1.$2")
    .replace(/\s+/g, " ")} `;

// The amount written just before a food: { n, unit, vague } or null.
function readAmount(words) {
  let n = null, unit = null, vague = null;
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    const next = words[i + 1];
    if (UNITS[w] && unit === null && n === null) unit = UNITS[w];
    else if (/^\d+(\.\d+)?$/.test(w)) { n = Number(w); break; }
    else if (w in WORD_NUMBERS && !(w === "a" && (next === "few" || next === "lot" || next === "couple"))) { n = WORD_NUMBERS[w]; break; }
    else if (w === "few" || w === "couple") { vague = w === "few" ? 3 : 2; break; }
    else if (w === "lot" || w === "lots" || w === "loads" || w === "many" || w === "plenty") { vague = "lot"; break; }
  }
  if (n === null && vague === null && unit === null) return null;
  return { n, unit, vague };
}

// Units of `food` for one match, from its amount.
function quantity(food, amount, breads) {
  if (!amount) return food.perBread && breads ? breads : food.def;
  if (amount.vague === "lot") return food.def * 2;
  if (amount.vague) return ["biscuit", "slice", "date"].includes(food.per) ? amount.vague : food.def;
  const n = amount.n ?? 1;
  const grams = amount.unit === "g" || amount.unit === "ml" ? n : amount.unit === "kg" ? n * 1000 : null;
  if (grams !== null) return grams / food.g;
  if (amount.unit === "cup" && food.per === "100 g") return (n * 150) / food.g; // a cup of curry ≈ 150 g
  if (amount.unit === "piece" && food.piece) return (n * food.piece) / food.g;
  if (amount.unit === null && n < 1) return n * food.def; // "half chicken curry" = half a portion
  if (amount.unit === null && n >= 30 && food.g >= 50 && food.per !== "egg") return n / food.g; // "200 diced chicken" = 200 g
  if (amount.unit === null && food.piece) return (n * food.piece) / food.g; // "2 chicken" = 2 pieces
  return n;
}

const round1 = (n) => Math.round(n * 10) / 10;
const BREADS = new Set(["Bread", "Naan", "Paratha", "Roti"]);

// Returns { kcal, p, c, f, items: [{ name, qty, per, kcal, p }] }, or null when no
// known food is found (the meal then needs a manual number).
export function estimateMeal(text) {
  const s = normalise(text);
  const taken = new Array(s.length).fill(false);
  const found = [];
  for (const { alias, food } of ALIASES) {
    // Plurals too: "parathas", "sandwiches".
    for (const form of [alias, `${alias}s`, `${alias}es`]) {
      let from = 0;
      for (;;) {
        const at = s.indexOf(` ${form} `, from);
        if (at < 0) break;
        const start = at + 1;
        const end = start + form.length;
        from = end;
        if (taken.slice(start, end).some(Boolean)) continue;
        for (let i = start; i < end; i++) taken[i] = true;
        found.push({ food, start, end });
      }
    }
  }
  if (found.length === 0) return null;
  found.sort((a, b) => a.start - b.start);

  const items = [];
  const seen = new Set();
  let breads = 0;
  let prevEnd = 0;
  for (const m of found) {
    // Only look back as far as the previous food, and at most 4 words.
    const words = s.slice(prevEnd, m.start).trim().split(" ").filter(Boolean).slice(-4);
    prevEnd = m.end;
    const amount = readAmount(words);
    // "4 slices pizza ... from fireaway pizza": a repeat with no amount is the same food.
    if (seen.has(m.food.name) && !amount) continue;
    seen.add(m.food.name);
    const qty = quantity(m.food, amount, breads);
    if (BREADS.has(m.food.name)) breads += qty;
    items.push({ name: m.food.name, qty: round1(qty), per: m.food.per, kcal: m.food.kcal * qty, p: m.food.p * qty, c: m.food.c * qty, f: m.food.f * qty });
  }
  const sum = items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  return {
    kcal: Math.round(sum.kcal),
    p: Math.round(sum.p),
    c: Math.round(sum.c),
    f: Math.round(sum.f),
    items: items.map((i) => ({ name: i.name, qty: i.qty, per: i.per, kcal: Math.round(i.kcal), p: Math.round(i.p) })),
  };
}

// What counts for a meal: your own numbers if you set them, otherwise the estimate.
// null when neither exists.
export function mealNumbers(meal) {
  const est = estimateMeal(meal.text);
  if (meal.kcal != null) {
    return { kcal: meal.kcal, p: meal.protein ?? est?.p ?? 0, c: est?.c ?? 0, f: est?.f ?? 0, items: est?.items ?? [], manual: true };
  }
  return est ? { ...est, manual: false } : null;
}

// "2 cup rice, 200 g chicken curry, 1 × egg"
const MEASURES = new Set(["cup", "slice", "glass", "can", "pack", "portion"]);
export function describeEstimate(est) {
  return est.items
    .map((i) => {
      const name = i.name.toLowerCase();
      if (i.per === "100 g") return `${Math.round(i.qty * 100)} g ${name}`;
      if (MEASURES.has(i.per)) return `${i.qty} ${i.per} ${name}`;
      return `${i.qty} × ${name}`;
    })
    .join(", ");
}

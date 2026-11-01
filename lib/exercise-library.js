// Built-in exercise library, loaded into the MongoDB `exercises` collection.
// Each row: [name, muscle group, equipment, type]
//   type "strength" -> logged as sets of reps (+ optional kg)
//   type "timed"    -> logged as sets of time (+ optional distance in km)
// Custom exercises added in the admin panel live alongside these.

export const CATEGORIES = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Glutes", "Core", "Full body", "Cardio", "Sports", "Mobility",
];

export const EQUIPMENT = [
  "Barbell", "Dumbbell", "Machine", "Cable", "Kettlebell", "Bodyweight", "Band", "Smith machine",
  "EZ bar", "Cardio machine", "Other",
];

const ROWS = [
  // Chest
  ["Barbell bench press", "Chest", "Barbell", "strength"],
  ["Incline barbell bench press", "Chest", "Barbell", "strength"],
  ["Decline barbell bench press", "Chest", "Barbell", "strength"],
  ["Dumbbell bench press", "Chest", "Dumbbell", "strength"],
  ["Incline dumbbell press", "Chest", "Dumbbell", "strength"],
  ["Decline dumbbell press", "Chest", "Dumbbell", "strength"],
  ["Dumbbell fly", "Chest", "Dumbbell", "strength"],
  ["Incline dumbbell fly", "Chest", "Dumbbell", "strength"],
  ["Machine chest press", "Chest", "Machine", "strength"],
  ["Pec deck", "Chest", "Machine", "strength"],
  ["Cable crossover", "Chest", "Cable", "strength"],
  ["Low-to-high cable fly", "Chest", "Cable", "strength"],
  ["Smith machine bench press", "Chest", "Smith machine", "strength"],
  ["Push-up", "Chest", "Bodyweight", "strength"],
  ["Incline push-up", "Chest", "Bodyweight", "strength"],
  ["Decline push-up", "Chest", "Bodyweight", "strength"],
  ["Diamond push-up", "Chest", "Bodyweight", "strength"],
  ["Wide push-up", "Chest", "Bodyweight", "strength"],
  ["Chest dip", "Chest", "Bodyweight", "strength"],
  ["Band chest press", "Chest", "Band", "strength"],

  // Back
  ["Deadlift", "Back", "Barbell", "strength"],
  ["Barbell row", "Back", "Barbell", "strength"],
  ["Pendlay row", "Back", "Barbell", "strength"],
  ["T-bar row", "Back", "Barbell", "strength"],
  ["Rack pull", "Back", "Barbell", "strength"],
  ["One-arm dumbbell row", "Back", "Dumbbell", "strength"],
  ["Chest-supported dumbbell row", "Back", "Dumbbell", "strength"],
  ["Seated cable row", "Back", "Cable", "strength"],
  ["Lat pulldown", "Back", "Cable", "strength"],
  ["Close-grip lat pulldown", "Back", "Cable", "strength"],
  ["Straight-arm cable pulldown", "Back", "Cable", "strength"],
  ["Machine row", "Back", "Machine", "strength"],
  ["Assisted pull-up", "Back", "Machine", "strength"],
  ["Pull-up", "Back", "Bodyweight", "strength"],
  ["Chin-up", "Back", "Bodyweight", "strength"],
  ["Inverted row", "Back", "Bodyweight", "strength"],
  ["Back extension", "Back", "Bodyweight", "strength"],
  ["Superman hold", "Back", "Bodyweight", "timed"],
  ["Good morning", "Back", "Barbell", "strength"],
  ["Resistance band row", "Back", "Band", "strength"],
  ["Band pull-apart", "Back", "Band", "strength"],

  // Shoulders
  ["Overhead barbell press", "Shoulders", "Barbell", "strength"],
  ["Seated dumbbell shoulder press", "Shoulders", "Dumbbell", "strength"],
  ["Arnold press", "Shoulders", "Dumbbell", "strength"],
  ["Machine shoulder press", "Shoulders", "Machine", "strength"],
  ["Smith machine shoulder press", "Shoulders", "Smith machine", "strength"],
  ["Landmine press", "Shoulders", "Barbell", "strength"],
  ["Dumbbell lateral raise", "Shoulders", "Dumbbell", "strength"],
  ["Cable lateral raise", "Shoulders", "Cable", "strength"],
  ["Machine lateral raise", "Shoulders", "Machine", "strength"],
  ["Dumbbell front raise", "Shoulders", "Dumbbell", "strength"],
  ["Rear delt dumbbell fly", "Shoulders", "Dumbbell", "strength"],
  ["Reverse pec deck", "Shoulders", "Machine", "strength"],
  ["Face pull", "Shoulders", "Cable", "strength"],
  ["Upright row", "Shoulders", "Barbell", "strength"],
  ["Barbell shrug", "Shoulders", "Barbell", "strength"],
  ["Dumbbell shrug", "Shoulders", "Dumbbell", "strength"],
  ["Pike push-up", "Shoulders", "Bodyweight", "strength"],
  ["Handstand push-up", "Shoulders", "Bodyweight", "strength"],
  ["Band shoulder dislocate", "Shoulders", "Band", "strength"],

  // Arms
  ["Barbell curl", "Arms", "Barbell", "strength"],
  ["EZ-bar curl", "Arms", "EZ bar", "strength"],
  ["Dumbbell bicep curl", "Arms", "Dumbbell", "strength"],
  ["Hammer curl", "Arms", "Dumbbell", "strength"],
  ["Incline dumbbell curl", "Arms", "Dumbbell", "strength"],
  ["Concentration curl", "Arms", "Dumbbell", "strength"],
  ["Preacher curl", "Arms", "EZ bar", "strength"],
  ["Cable curl", "Arms", "Cable", "strength"],
  ["Reverse curl", "Arms", "EZ bar", "strength"],
  ["Wrist curl", "Arms", "Dumbbell", "strength"],
  ["Close-grip bench press", "Arms", "Barbell", "strength"],
  ["Skull crusher", "Arms", "EZ bar", "strength"],
  ["Triceps rope pushdown", "Arms", "Cable", "strength"],
  ["Straight-bar triceps pushdown", "Arms", "Cable", "strength"],
  ["Overhead cable triceps extension", "Arms", "Cable", "strength"],
  ["Overhead dumbbell triceps extension", "Arms", "Dumbbell", "strength"],
  ["Dumbbell triceps kickback", "Arms", "Dumbbell", "strength"],
  ["Triceps dip", "Arms", "Bodyweight", "strength"],
  ["Bench dip", "Arms", "Bodyweight", "strength"],
  ["Band bicep curl", "Arms", "Band", "strength"],

  // Legs
  ["Barbell back squat", "Legs", "Barbell", "strength"],
  ["Front squat", "Legs", "Barbell", "strength"],
  ["Goblet squat", "Legs", "Dumbbell", "strength"],
  ["Smith machine squat", "Legs", "Smith machine", "strength"],
  ["Hack squat", "Legs", "Machine", "strength"],
  ["Leg press", "Legs", "Machine", "strength"],
  ["Bulgarian split squat", "Legs", "Dumbbell", "strength"],
  ["Dumbbell walking lunge", "Legs", "Dumbbell", "strength"],
  ["Reverse lunge", "Legs", "Dumbbell", "strength"],
  ["Step-up", "Legs", "Dumbbell", "strength"],
  ["Romanian deadlift", "Legs", "Barbell", "strength"],
  ["Dumbbell Romanian deadlift", "Legs", "Dumbbell", "strength"],
  ["Sumo deadlift", "Legs", "Barbell", "strength"],
  ["Trap bar deadlift", "Legs", "Barbell", "strength"],
  ["Leg extension", "Legs", "Machine", "strength"],
  ["Lying leg curl", "Legs", "Machine", "strength"],
  ["Seated leg curl", "Legs", "Machine", "strength"],
  ["Nordic hamstring curl", "Legs", "Bodyweight", "strength"],
  ["Standing calf raise", "Legs", "Machine", "strength"],
  ["Seated calf raise", "Legs", "Machine", "strength"],
  ["Leg press calf raise", "Legs", "Machine", "strength"],
  ["Hip adduction machine", "Legs", "Machine", "strength"],
  ["Bodyweight squat", "Legs", "Bodyweight", "strength"],
  ["Jump squat", "Legs", "Bodyweight", "strength"],
  ["Pistol squat", "Legs", "Bodyweight", "strength"],
  ["Bodyweight lunge", "Legs", "Bodyweight", "strength"],
  ["Wall sit", "Legs", "Bodyweight", "timed"],
  ["Band squat", "Legs", "Band", "strength"],

  // Glutes
  ["Barbell hip thrust", "Glutes", "Barbell", "strength"],
  ["Machine hip thrust", "Glutes", "Machine", "strength"],
  ["Glute bridge", "Glutes", "Bodyweight", "strength"],
  ["Single-leg glute bridge", "Glutes", "Bodyweight", "strength"],
  ["Cable glute kickback", "Glutes", "Cable", "strength"],
  ["Hip abduction machine", "Glutes", "Machine", "strength"],
  ["Kettlebell swing", "Glutes", "Kettlebell", "strength"],
  ["Band lateral walk", "Glutes", "Band", "strength"],

  // Core
  ["Plank", "Core", "Bodyweight", "timed"],
  ["Side plank", "Core", "Bodyweight", "timed"],
  ["Hollow body hold", "Core", "Bodyweight", "timed"],
  ["Hanging knee raise", "Core", "Bodyweight", "strength"],
  ["Hanging leg raise", "Core", "Bodyweight", "strength"],
  ["Lying leg raise", "Core", "Bodyweight", "strength"],
  ["Crunch", "Core", "Bodyweight", "strength"],
  ["Sit-up", "Core", "Bodyweight", "strength"],
  ["Decline sit-up", "Core", "Bodyweight", "strength"],
  ["Bicycle crunch", "Core", "Bodyweight", "strength"],
  ["V-up", "Core", "Bodyweight", "strength"],
  ["Russian twist", "Core", "Bodyweight", "strength"],
  ["Dead bug", "Core", "Bodyweight", "strength"],
  ["Bird dog", "Core", "Bodyweight", "strength"],
  ["Mountain climber", "Core", "Bodyweight", "timed"],
  ["Ab wheel rollout", "Core", "Other", "strength"],
  ["Cable crunch", "Core", "Cable", "strength"],
  ["Pallof press", "Core", "Cable", "strength"],
  ["Cable woodchop", "Core", "Cable", "strength"],

  // Full body
  ["Power clean", "Full body", "Barbell", "strength"],
  ["Barbell thruster", "Full body", "Barbell", "strength"],
  ["Dumbbell thruster", "Full body", "Dumbbell", "strength"],
  ["Burpee", "Full body", "Bodyweight", "strength"],
  ["Turkish get-up", "Full body", "Kettlebell", "strength"],
  ["Kettlebell clean and press", "Full body", "Kettlebell", "strength"],
  ["Medicine ball slam", "Full body", "Other", "strength"],
  ["Box jump", "Full body", "Other", "strength"],
  ["Farmer's carry", "Full body", "Dumbbell", "timed"],
  ["Sled push", "Full body", "Other", "timed"],
  ["Battle ropes", "Full body", "Other", "timed"],

  // Cardio
  ["Running", "Cardio", "Bodyweight", "timed"],
  ["Treadmill run", "Cardio", "Cardio machine", "timed"],
  ["Incline treadmill walk", "Cardio", "Cardio machine", "timed"],
  ["Walking", "Cardio", "Bodyweight", "timed"],
  ["Cycling", "Cardio", "Other", "timed"],
  ["Stationary bike", "Cardio", "Cardio machine", "timed"],
  ["Rowing machine", "Cardio", "Cardio machine", "timed"],
  ["Elliptical", "Cardio", "Cardio machine", "timed"],
  ["Stair climber", "Cardio", "Cardio machine", "timed"],
  ["Assault bike", "Cardio", "Cardio machine", "timed"],
  ["Swimming", "Cardio", "Other", "timed"],
  ["Jump rope", "Cardio", "Other", "timed"],
  ["HIIT intervals", "Cardio", "Bodyweight", "timed"],
  ["Hiking", "Cardio", "Bodyweight", "timed"],

  // Sports
  ["Table tennis", "Sports", "Other", "timed"],
  ["Football", "Sports", "Other", "timed"],
  ["Badminton", "Sports", "Other", "timed"],
  ["Basketball", "Sports", "Other", "timed"],
  ["Cricket", "Sports", "Other", "timed"],
  ["Tennis", "Sports", "Other", "timed"],
  ["Boxing bag work", "Sports", "Other", "timed"],

  // Mobility
  ["Stretching session", "Mobility", "Bodyweight", "timed"],
  ["Yoga", "Mobility", "Bodyweight", "timed"],
  ["Foam rolling", "Mobility", "Other", "timed"],
  ["Hip flexor stretch", "Mobility", "Bodyweight", "timed"],
  ["Hamstring stretch", "Mobility", "Bodyweight", "timed"],
  ["Thoracic spine rotation", "Mobility", "Bodyweight", "strength"],
  ["Cat-cow", "Mobility", "Bodyweight", "strength"],
];

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const EXERCISES = ROWS.map(([name, category, equipment, type]) => ({
  _id: slugify(name),
  name,
  category,
  equipment,
  type,
  custom: false,
}));

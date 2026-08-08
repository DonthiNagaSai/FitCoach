export interface Exercise {
  name: string
  sets: number
  reps: string
  weight: string
  rest: string
  category: string
}

export interface WorkoutDay {
  day: string
  type: string
  muscle: string
  duration: string
  rest?: boolean
  exercises: Exercise[]
}

export interface MealItem {
  name: string
  cals: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  name: string
  time: string
  items: MealItem[]
}

export interface DietTargets {
  cals: number
  protein: number
  carbs: number
  fat: number
}

export interface Plan {
  id: string
  created_at: string
  workout: { weekPlan: WorkoutDay[] }
  diet: { targets: DietTargets; meals: Meal[] }
}

export type IngredientInfo = {
  name: string;
  detail?: string;
};

export type RecipeStep = {
  order: number;
  instruction: string;
};

export type NutritionFact = {
  calories: number;
  sugar: number;
  caffeine: number;
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: '상시' | '시즌';
  kioskExposure: boolean;
  seasonTerm?: string;
  imageUrl: string;
  description: string;
  releaseDate: string;
  tags: string[];
  highlights: string[];
  ingredients: IngredientInfo[];
  recipe: RecipeStep[];
  nutrition: NutritionFact;
  allergens: string[];
};

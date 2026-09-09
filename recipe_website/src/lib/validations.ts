import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const pinLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
    confirmPin: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs don't match",
    path: ["confirmPin"],
  });

export const recipeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  prepTime: z.number().min(1, "Prep time must be at least 1 minute"),
  cookTime: z.number().min(1, "Cook time must be at least 1 minute"),
  totalTime: z
    .number()
    .min(1, "Total time must be at least 1 minute")
    .optional(),
  servings: z.number().min(1, "Must serve at least 1 person"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  cuisine: z.string().min(2, "Cuisine must be specified"),
  category: z.string().min(2, "Category must be specified"),
  mealCourse: z.string().min(2, "Meal course must be specified"),
  country: z.string().min(2, "Country must be specified"),
  instructions: z
    .string()
    .min(50, "Instructions must be at least 50 characters"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, "Ingredient name is required"),
        amount: z.string().min(1, "Amount is required"),
        unit: z.string(),
      })
    )
    .min(1, "Add at least one ingredient"),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type PinLoginInput = z.infer<typeof pinLoginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

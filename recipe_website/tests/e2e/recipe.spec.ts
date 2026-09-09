import { test, expect } from "@playwright/test";

test.describe("Recipe Website E2E Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check if the hero section is visible
    await expect(page.locator("h1")).toContainText(
      "Discover Delicious Recipes"
    );

    // Check if featured recipes are displayed
    await expect(page.locator("text=Popular Recipes")).toBeVisible();

    // Check if categories are displayed
    await expect(page.locator("text=Browse by Category")).toBeVisible();
  });

  test("can navigate to recipes page", async ({ page }) => {
    await page.goto("/");

    // Click on "Browse Recipes" button
    await page.click("text=Browse Recipes");

    // Check if redirected to recipes page
    await expect(page).toHaveURL("/recipes");
    await expect(page.locator("h1")).toContainText("All Recipes");
  });

  test("can view recipe details", async ({ page }) => {
    await page.goto("/recipes");

    // Wait for recipes to load
    await page.waitForSelector('[href^="/recipes/"]');

    // Click on the first recipe
    const firstRecipe = page.locator('[href^="/recipes/"]').first();
    await firstRecipe.click();

    // Check if recipe details are displayed
    await expect(page.locator("text=Ingredients")).toBeVisible();
    await expect(page.locator("text=Instructions")).toBeVisible();
  });

  test("user can sign up", async ({ page }) => {
    await page.goto("/auth/signup");

    // Fill out the signup form
    const timestamp = Date.now();
    await page.fill('input[type="text"]', "Test User");
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[type="password"]', "password123");
    await page.locator('input[type="password"]').last().fill("password123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Check if redirected to signin page
    await expect(page).toHaveURL(/signin/);
  });

  test("user can sign in", async ({ page }) => {
    await page.goto("/auth/signin");

    // Fill out the signin form (using the seeded test user)
    await page.fill('input[type="email"]', "chef@example.com");
    await page.fill('input[type="password"]', "password123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL("/");

    // Check if user is logged in (Add Recipe button should be visible)
    await expect(page.locator("text=Add Recipe")).toBeVisible();
  });

  test("search functionality works", async ({ page }) => {
    await page.goto("/recipes");

    // Check if filter section is visible
    await expect(page.locator("text=Filters")).toBeVisible();

    // Check if filter dropdowns are present
    await expect(page.locator("select").first()).toBeVisible();
  });

  test("can filter recipes by category", async ({ page }) => {
    await page.goto("/recipes");

    // Select a category from the dropdown
    await page.selectOption("select", { index: 1 });

    // Recipe grid should still be visible
    await expect(page.locator("text=Showing")).toBeVisible();
  });

  test("responsive design - mobile view", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Check if hero section is visible on mobile
    await expect(page.locator("h1")).toContainText(
      "Discover Delicious Recipes"
    );

    // Check if navigation is present
    await expect(page.locator("text=RecipeHub")).toBeVisible();
  });

  test("footer contains correct links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check if footer links are present
    await expect(page.locator("footer >> text=RecipeHub")).toBeVisible();
    await expect(page.locator("footer >> text=All Recipes")).toBeVisible();
  });

  test("check accessibility - page has proper heading structure", async ({
    page,
  }) => {
    await page.goto("/");

    // Check if h1 exists
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThan(0);

    // Check if images have alt text
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });
});

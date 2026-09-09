import {
  formatDate,
  formatTime,
  generateSlug,
  truncateText,
  calculateAverageRating,
  getDifficultyColor,
} from "../utils";

describe("Utils Functions", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toBe("January 15, 2024");
    });

    it("should handle string input", () => {
      const formatted = formatDate("2024-12-25");
      expect(formatted).toContain("December");
    });
  });

  describe("formatTime", () => {
    it("should format minutes correctly", () => {
      expect(formatTime(30)).toBe("30min");
      expect(formatTime(45)).toBe("45min");
    });

    it("should format hours correctly", () => {
      expect(formatTime(60)).toBe("1h");
      expect(formatTime(120)).toBe("2h");
    });

    it("should format hours and minutes correctly", () => {
      expect(formatTime(90)).toBe("1h 30min");
      expect(formatTime(150)).toBe("2h 30min");
    });
  });

  describe("generateSlug", () => {
    it("should convert text to slug", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
      expect(generateSlug("Chocolate Chip Cookies")).toBe(
        "chocolate-chip-cookies"
      );
    });

    it("should remove special characters", () => {
      expect(generateSlug("Hello, World!")).toBe("hello-world");
      expect(generateSlug("Test @ #123")).toBe("test-123");
    });

    it("should handle multiple spaces", () => {
      expect(generateSlug("Hello   World")).toBe("hello-world");
    });

    it("should trim leading and trailing dashes", () => {
      expect(generateSlug("  hello world  ")).toBe("hello-world");
    });
  });

  describe("truncateText", () => {
    it("should truncate long text", () => {
      const text = "This is a very long text that needs to be truncated";
      expect(truncateText(text, 20)).toBe("This is a very long...");
    });

    it("should not truncate short text", () => {
      const text = "Short text";
      expect(truncateText(text, 20)).toBe("Short text");
    });

    it("should handle exact length", () => {
      const text = "Exactly twenty chars";
      expect(truncateText(text, 20)).toBe("Exactly twenty chars");
    });
  });

  describe("calculateAverageRating", () => {
    it("should calculate average rating correctly", () => {
      const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 3 }];
      expect(calculateAverageRating(reviews)).toBe(4);
    });

    it("should return 0 for no reviews", () => {
      expect(calculateAverageRating([])).toBe(0);
    });

    it("should round to one decimal place", () => {
      const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }];
      expect(calculateAverageRating(reviews)).toBe(4.3);
    });
  });

  describe("getDifficultyColor", () => {
    it("should return correct color for EASY", () => {
      expect(getDifficultyColor("EASY")).toBe("text-green-600 bg-green-50");
      expect(getDifficultyColor("easy")).toBe("text-green-600 bg-green-50");
    });

    it("should return correct color for MEDIUM", () => {
      expect(getDifficultyColor("MEDIUM")).toBe("text-yellow-600 bg-yellow-50");
    });

    it("should return correct color for HARD", () => {
      expect(getDifficultyColor("HARD")).toBe("text-red-600 bg-red-50");
    });

    it("should return default color for unknown difficulty", () => {
      expect(getDifficultyColor("UNKNOWN")).toBe("text-gray-600 bg-gray-50");
    });
  });
});

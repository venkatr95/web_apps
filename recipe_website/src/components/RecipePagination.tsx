"use client";

import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";

interface RecipePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecipes: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export default function RecipePagination({
  currentPage,
  totalPages,
  totalRecipes,
  itemsPerPage,
  startIndex,
  endIndex,
}: RecipePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    router.push(`/${locale}/recipes?${params.toString()}`);
  };

  const updateLimit = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (limit !== "9") {
      params.set("limit", limit);
    } else {
      params.delete("limit");
    }
    params.delete("page"); // Reset to first page when changing limit
    router.push(`/${locale}/recipes?${params.toString()}`);
  };

  const updateCustomLimit = (limit: string) => {
    const value = parseInt(limit, 10);
    if (Number.isNaN(value) || value <= 0) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", value.toString());
    params.delete("page");
    router.push(`/${locale}/recipes?${params.toString()}`);
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalRecipes === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Results info and items per page selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
          <span className="font-semibold">{endIndex}</span> of{" "}
          <span className="font-semibold">{totalRecipes}</span> recipes
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span>Show:</span>
          <Select
            value={itemsPerPage.toString()}
            onChange={(e) => updateLimit(e.target.value)}
            className="w-full sm:w-28"
          >
            {Array.from({ length: 10 }).map((_, i) => {
              const val = (i + 1) * 9;
              return (
                <option key={val} value={val.toString()}>
                  {val}
                </option>
              );
            })}
          </Select>
          <span>or</span>
          <Input
            defaultValue={itemsPerPage.toString()}
            className="w-full sm:w-24"
            type="number"
            min={1}
            onBlur={(e) => updateCustomLimit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateCustomLimit((e.target as HTMLInputElement).value);
              }
            }}
          />
          <span>per page</span>
        </div>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex gap-1 flex-wrap">
            {generatePageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              return (
                <button
                  key={pageNum}
                  onClick={() => updatePage(pageNum)}
                  className={`min-w-[36px] px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

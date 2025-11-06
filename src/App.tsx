import React, { useEffect, useState, useMemo } from "react";
import { fetchQuestions } from "./services/api";
import { Question, CategoryCount, DifficultyCount } from "./types";
import CategoryChart from "./components/CategoryChart";
import DifficultyChart from "./components/DifficultyChart";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const questionsPerPage = 5;

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput);
    const maxPage = Math.ceil(filteredQuestions.length / questionsPerPage);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= maxPage) {
      setCurrentPage(pageNumber);
      setPageInput("");
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetchQuestions(60);
        setQuestions(response.results);
      } catch (err) {
        setError("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category === selectedCategory)
    : questions;

  const categoryData = useMemo<CategoryCount[]>(() => {
    const categories = questions.reduce(
      (acc: { [key: string]: number }, question) => {
        acc[question.category] = (acc[question.category] || 0) + 1;
        return acc;
      },
      {}
    );

    const sortedCategories = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    );

    const topCategories: CategoryCount[] = sortedCategories
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
      }));

    if (sortedCategories.length > 10) {
      const otherCategories = sortedCategories
        .slice(10)
        .map(([name, count]) => ({ name, count }));

      const otherCount = otherCategories.reduce(
        (sum, cat) => sum + cat.count,
        0
      );

      const otherCategory: CategoryCount = {
        name: "Other",
        count: otherCount,
        otherCategories: otherCategories,
      };

      topCategories.push(otherCategory);
    }

    return topCategories;
  }, [questions]);

  const allCategories = useMemo(() => {
    const flattened: CategoryCount[] = [];

    categoryData.forEach((cat) => {
      if (cat.name === "Other" && cat.otherCategories) {
        flattened.push(...cat.otherCategories);
      } else {
        flattened.push(cat);
      }
    });

    return flattened;
  }, [categoryData]);

  const difficultyData = useMemo<DifficultyCount[]>(() => {
    const difficulties = filteredQuestions.reduce(
      (acc: { [key: string]: number }, question) => {
        acc[question.difficulty] = (acc[question.difficulty] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(difficulties).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    }));
  }, [filteredQuestions]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trivia Questions Visualization
          </h1>
          <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <div>
              <p className="text-gray-900 font-medium">Loading questions</p>
              <p className="text-gray-600 text-sm">
                This may take a moment, thanks for your patience.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Trivia Questions Visualization
          </h1>
          <div className="mt-4 sm:mt-0">
            <div className="text-sm text-gray-600"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Categories</h2>
              <div className="ml-4">
                <label className="sr-only" htmlFor="category-select">
                  Category
                </label>
                <select
                  id="category-select"
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <CategoryChart
              data={categoryData}
              onCategorySelect={(category) => setSelectedCategory(category)}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Questions by Difficulty
            </h2>
            <DifficultyChart data={difficultyData} />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Questions {selectedCategory ? `for ${selectedCategory}` : ""}
            </h2>
            <div className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-medium text-gray-900">
                {filteredQuestions.length}
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredQuestions
              .slice(
                (currentPage - 1) * questionsPerPage,
                currentPage * questionsPerPage
              )
              .map((question, index) => (
                <li key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3">
                      {(currentPage - 1) * questionsPerPage + index + 1}
                    </span>
                    <div>
                      <p
                        className="text-gray-900"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Difficulty:{" "}
                        <span
                          className={`capitalize ${
                            question.difficulty === "easy"
                              ? "text-green-600"
                              : question.difficulty === "medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
          </ul>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <div className="flex items-center space-x-4 text-sm text-gray-700">
                <span>
                  Page {currentPage} of{" "}
                  {Math.ceil(filteredQuestions.length / questionsPerPage)}
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={Math.ceil(filteredQuestions.length / questionsPerPage)}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handlePageJump();
                      }
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Page"
                  />
                  <button
                    onClick={handlePageJump}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    Go
                  </button>
                </div>
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredQuestions.length / questionsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage >=
                  Math.ceil(filteredQuestions.length / questionsPerPage)
                }
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage >=
                  Math.ceil(filteredQuestions.length / questionsPerPage)
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

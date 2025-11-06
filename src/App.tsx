import React, { useEffect, useState, useMemo } from "react";
import { fetchQuestions } from "./services/api";
import { Question, CategoryCount, DifficultyCount } from "./types";
import CategoryChart from "./components/CategoryChart";
import DifficultyChart from "./components/DifficultyChart";
import "./App.css";
import { DIFFICULTY_COLORS } from "./constants/colors";

const DIFFICULTY_ORDER: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "none" | "easyToHard" | "hardToEasy"
  >("none");
  const questionsPerPage = 5;

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput);
    const maxPage = Math.ceil(sortedQuestions.length / questionsPerPage);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= maxPage) {
      setCurrentPage(pageNumber);
      setPageInput("");
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetchQuestions(70);
        setQuestions(response.results);
      } catch (err) {
        setError("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => setCurrentPage(1), [selectedCategory]);

  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category === selectedCategory)
    : questions;

  const sortedQuestions = useMemo(() => {
    if (sortOrder === "none") return filteredQuestions;

    return [...filteredQuestions].sort((a, b) => {
      const diffA = DIFFICULTY_ORDER[a.difficulty];
      const diffB = DIFFICULTY_ORDER[b.difficulty];
      return sortOrder === "easyToHard" ? diffA - diffB : diffB - diffA;
    });
  }, [filteredQuestions, sortOrder]);

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
      .map(([name, count]) => ({ name, count }));

    if (sortedCategories.length > 10) {
      const otherCategories = sortedCategories
        .slice(10)
        .map(([name, count]) => ({
          name,
          count,
        }));

      const otherCount = otherCategories.reduce(
        (sum, cat) => sum + cat.count,
        0
      );
      topCategories.push({
        name: "Other",
        count: otherCount,
        otherCategories,
      });
    }

    return topCategories;
  }, [questions]);

  const allCategories = useMemo(() => {
    const flattened: CategoryCount[] = [];
    categoryData.forEach((cat) => {
      if (cat.name === "Other" && cat.otherCategories)
        flattened.push(...cat.otherCategories);
      else flattened.push(cat);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md flex items-center gap-4">
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
            <p className="text-gray-900 font-semibold">Loading questions...</p>
            <p className="text-gray-500 text-sm">
              This may take a moment, thanks for your patience.
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="bg-white shadow-sm rounded-xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 tracking-tight">
            Trivia Questions Visualizer
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5 flex items-center justify-between pb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Questions by Category
              </h2>
              <select
                id="category-select"
                className={`block px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition
  ${selectedCategory ? "border-indigo-400" : "border-gray-300"}
`}
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
            <CategoryChart
              data={categoryData}
              onCategorySelect={(category) => setSelectedCategory(category)}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Questions by Difficulty
            </h2>
            <DifficultyChart data={difficultyData} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedCategory
                ? `Questions for ${selectedCategory}`
                : "All Questions"}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Total:{" "}
                <span className="font-medium text-gray-800">
                  {sortedQuestions.length}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  Sort:
                </label>
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(
                      e.target.value as "none" | "easyToHard" | "hardToEasy"
                    )
                  }
                  className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="none">None</option>
                  <option value="easyToHard">Easy → Hard</option>
                  <option value="hardToEasy">Hard → Easy</option>
                </select>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {sortedQuestions
              .slice(
                (currentPage - 1) * questionsPerPage,
                currentPage * questionsPerPage
              )
              .map((question, index) => (
                <li
                  key={index}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3">
                      {(currentPage - 1) * questionsPerPage + index + 1}
                    </span>
                    <div>
                      <p
                        className="text-gray-900 font-medium"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Difficulty:{" "}
                        <span
                          className="capitalize font-medium"
                          style={{
                            color:
                              DIFFICULTY_COLORS[
                                question.difficulty.charAt(0).toUpperCase() +
                                  question.difficulty.slice(1)
                              ],
                          }}
                        >
                          {question.difficulty}
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
          </ul>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors
    ${
      currentPage === 1
        ? "bg-gray-100 text-gray-400 cursor-default"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <span>
                Page {currentPage} of{" "}
                {Math.ceil(sortedQuestions.length / questionsPerPage)}
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={Math.ceil(sortedQuestions.length / questionsPerPage)}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePageJump()}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Page"
                />
                <button
                  onClick={handlePageJump}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
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
                    Math.ceil(sortedQuestions.length / questionsPerPage)
                  )
                )
              }
              disabled={
                currentPage >=
                Math.ceil(sortedQuestions.length / questionsPerPage)
              }
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors
    ${
      currentPage >= Math.ceil(sortedQuestions.length / questionsPerPage)
        ? "bg-gray-100 text-gray-400 cursor-default opacity-70"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

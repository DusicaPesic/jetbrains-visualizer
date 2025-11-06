import React, { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CategoryCount } from "../types";

interface Props {
  data: CategoryCount[];
  onCategorySelect?: (category: string) => void;
}

const CategoryChart: React.FC<Props> = ({ data, onCategorySelect }) => {
  const [hoveredData, setHoveredData] = useState<CategoryCount | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  return (
    <div className="h-96 w-full relative outline-none focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 30, bottom: 90 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const d = payload[0].payload as CategoryCount;
                if (hideTimeout.current) clearTimeout(hideTimeout.current);
                setHoveredData(d);
              } else {
                hideTimeout.current = setTimeout(
                  () => setHoveredData(null),
                  200
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            fill="#6366f1"
            isAnimationActive={false}
            onClick={(data: any) => {
              const categoryName = data?.name;
              if (categoryName === "Other") return;
              if (categoryName && onCategorySelect) {
                onCategorySelect(categoryName);
              }
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {hoveredData && (
        <div
          className="absolute bg-white p-4 shadow-lg rounded-lg border border-gray-200 w-64"
          style={{
            top: 60,
            left: "45%",
          }}
          onMouseEnter={() => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
          }}
          onMouseLeave={() => {
            hideTimeout.current = setTimeout(() => setHoveredData(null), 200);
          }}
        >
          <p className="font-semibold text-gray-800 mb-1">{hoveredData.name}</p>

          {hoveredData.name === "Other" && hoveredData.otherCategories ? (
            <div className="max-h-[300px] overflow-y-auto pr-4">
              {hoveredData.otherCategories.map((cat, i) => (
                <div
                  key={i}
                  className="flex justify-between gap-4 py-1"
                  onClick={() => onCategorySelect?.(cat.name)}
                >
                  <span>{cat.name}:</span>
                  <span className="text-indigo-600 font-medium">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              Total:{" "}
              <span className="text-indigo-600 font-medium">
                {hoveredData.count}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryChart;

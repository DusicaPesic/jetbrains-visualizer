import React from "react";
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
}

const CategoryChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload as CategoryCount;
                if (data.name === "Other" && data.otherCategories) {
                  return (
                    <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
                      <p className="font-semibold mb-2">Other Categories:</p>
                      <div className="max-h-[200px] overflow-y-auto">
                        {data.otherCategories.map((cat, index) => (
                          <div
                            key={index}
                            className="flex justify-between gap-4 py-1"
                          >
                            <span>{cat.name}:</span>
                            <span className="text-indigo-600 font-medium">
                              {cat.count}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span className="text-indigo-600 font-medium">
                            {data.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200">
                    <p>
                      {data.name}:{" "}
                      <span className="text-indigo-600 font-medium">
                        {data.count}
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#4F46E5" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DifficultyCount } from "../types";
import { DIFFICULTY_COLORS } from "../constants/colors";
interface Props {
  data: DifficultyCount[];
}

type ChartData = {
  [key: string]: string | number;
  name: string;
  count: number;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload as DifficultyCount;
    return (
      <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
        <p className="text-gray-800 font-medium">
          {item.name}:{" "}
          <span className="text-indigo-600 font-semibold">{item.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

const FixedLegend = () => (
  <ul className="flex justify-center gap-6 mt-4">
    {["Easy", "Medium", "Hard"].map((name) => (
      <li key={name} className="flex items-center gap-2 text-sm text-gray-700">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: DIFFICULTY_COLORS[name] }}
        />
        {name}
      </li>
    ))}
  </ul>
);

const DifficultyChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-96 w-full flex flex-col items-center justify-center">
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as ChartData[]}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              dataKey="count"
              nameKey="name"
              isAnimationActive={false}
              label={({ name, percent }: any) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DIFFICULTY_COLORS[entry.name] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={<CustomTooltip />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <FixedLegend />
    </div>
  );
};

export default DifficultyChart;

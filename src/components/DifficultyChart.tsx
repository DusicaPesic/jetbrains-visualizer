import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DifficultyCount } from "../types";

interface Props {
  data: DifficultyCount[];
}
type ChartData = {
  [key: string]: string | number;
  name: string;
  count: number;
};

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

const DifficultyChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data as ChartData[]}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
            isAnimationActive={false}
            label={({ name, value, percent }: any) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DifficultyChart;

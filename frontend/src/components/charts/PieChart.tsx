"use client";

import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CHART_COLORS, TOOLTIP_STYLE } from "./theme";

export interface PieDatum {
  name: string;
  value: number;
}

export default function PieChart({
  data,
  innerRadius = 0,
  height = 260,
}: {
  data: PieDatum[];
  innerRadius?: number;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={90}
            paddingAngle={innerRadius > 0 ? 2 : 0}
            label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#9aa4ad" }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

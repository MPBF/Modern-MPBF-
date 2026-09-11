import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatNumber } from "../../lib/formatNumber";

interface InteractivePieChartProps {
  data: any[];
  title: string;
  description?: string;
  nameKey: string;
  valueKey: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  formatValue?: (value: any) => string;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
];

const CustomTooltip = ({ active, payload, formatValue }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg"
        dir="rtl"
      >
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm" style={{ color: data.fill }}>
          {`القيمة: ${formatValue ? formatValue(data.value) : data.value}`}
        </p>
        {data.payload.percentage && (
          <p className="text-sm text-gray-600">
            {`النسبة: ${formatNumber(data.payload.percentage, 1)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for slices less than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function InteractivePieChart({
  data,
  title,
  description,
  nameKey,
  valueKey,
  colors = COLORS,
  height = 300,
  showLegend = true,
  showLabels = true,
  formatValue,
  className = "",
  innerRadius = 0,
  outerRadius = 80,
}: InteractivePieChartProps) {
  // Calculate percentages
  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  const dataWithPercentages = data.map((item) => ({
    ...item,
    percentage: total > 0 ? (item[valueKey] / total) * 100 : 0,
  }));

  return (
    <Card className={`${className}`} data-testid="chart-interactive-pie">
      <CardHeader>
        <CardTitle
          className="text-lg font-semibold text-gray-900"
          data-testid="text-chart-title"
        >
          {title}
        </CardTitle>
        {description && (
          <p
            className="text-sm text-gray-600"
            data-testid="text-chart-description"
          >
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? renderCustomLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey={valueKey}
              nameKey={nameKey}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export function ChartContainer({ children, className, height = 300 }: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

interface LineChartProps {
  data: Array<{ date: string; value: number; label?: string }>;
  color?: string;
  showArea?: boolean;
  yAxisFormatter?: (value: number) => string;
}

export function TrendLineChart({ 
  data, 
  color = '#0a5193',
  showArea = false,
  yAxisFormatter = (v) => `${v}`
}: LineChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <ChartContainer>
      <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={yAxisFormatter}
          stroke="#9ca3af"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value) => [yAxisFormatter(Number(value)), 'Valor']}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleDateString('pt-BR');
          }}
        />
        <DataComponent
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={showArea ? 'url(#colorGradient)' : undefined}
          dot={false}
        />
      </ChartComponent>
    </ChartContainer>
  );
}

interface BarChartProps {
  data: Array<{ name: string; [key: string]: string | number }>;
  bars: Array<{ key: string; color: string; name: string }>;
  yAxisFormatter?: (value: number) => string;
}

export function ComparisonBarChart({ 
  data, 
  bars,
  yAxisFormatter = (v) => `${v}`
}: BarChartProps) {
  return (
    <ChartContainer>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={yAxisFormatter}
          stroke="#9ca3af"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <Legend />
        {bars.map((bar) => (
          <Bar 
            key={bar.key}
            dataKey={bar.key} 
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
}

export function DistributionPieChart({ 
  data,
  colors = ['#0a5193', '#ec6608', '#22c55e', '#f59e0b', '#ef4444']
}: PieChartProps) {
  return (
    <ChartContainer height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value, name) => [`${value}`, name]}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ChartContainer>
  );
}
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
  color = '#000000',
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
        <CartesianGrid strokeDasharray="0" stroke="#00000010" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-space-mono)', fill: '#000' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
          stroke="#000000"
          strokeWidth={2}
          axisLine={true}
        />
        <YAxis 
          tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-space-mono)', fill: '#000' }}
          tickFormatter={yAxisFormatter}
          stroke="#000000"
          strokeWidth={2}
          axisLine={true}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '3px solid #000',
            borderRadius: '0',
            boxShadow: '4px 4px 0px #000',
            fontSize: '12px',
            fontFamily: 'var(--font-space-mono)',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
          itemStyle={{ color: '#000' }}
          cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '4 4' }}
          formatter={(value) => [yAxisFormatter(Number(value)), 'VALOR']}
          labelFormatter={(label) => {
            const date = new Date(label);
            return `DATA: ${date.toLocaleDateString('pt-BR')}`;
          }}
        />
        <DataComponent
          type="stepAfter"
          dataKey="value"
          stroke={color}
          strokeWidth={4}
          fill={showArea ? 'url(#colorGradient)' : 'none'}
          dot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 3 }}
          activeDot={{ r: 6, fill: color, stroke: '#000', strokeWidth: 2 }}
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
        <CartesianGrid strokeDasharray="0" stroke="#00000010" vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-space-mono)', fill: '#000' }}
          stroke="#000"
          strokeWidth={2}
        />
        <YAxis 
          tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-space-mono)', fill: '#000' }}
          tickFormatter={yAxisFormatter}
          stroke="#000"
          strokeWidth={2}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '3px solid #000',
            borderRadius: '0',
            boxShadow: '4px 4px 0px #000',
            fontSize: '12px',
            fontFamily: 'var(--font-space-mono)',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
          itemStyle={{ color: '#000' }}
          cursor={{ fill: '#00000010' }}
        />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px', 
            fontFamily: 'var(--font-space-mono)', 
            fontWeight: 900, 
            fontSize: '10px',
            textTransform: 'uppercase'
          }}
        />
        {bars.map((bar) => (
          <Bar 
            key={bar.key}
            dataKey={bar.key} 
            name={bar.name.toUpperCase()}
            fill={bar.color}
            stroke="#000"
            strokeWidth={3}
            radius={0}
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
  colors = ['#A3E635', '#F472B6', '#3B82F6', '#FBBF24', '#EF4444']
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
          paddingAngle={0}
          dataKey="value"
          stroke="#000"
          strokeWidth={3}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '3px solid #000',
            borderRadius: '0',
            boxShadow: '4px 4px 0px #000',
            fontSize: '12px',
            fontFamily: 'var(--font-space-mono)',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
          itemStyle={{ color: '#000' }}
          formatter={(value, name) => [`${value}`, name]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ 
            fontFamily: 'var(--font-space-mono)', 
            fontWeight: 900, 
            fontSize: '10px',
            textTransform: 'uppercase'
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}
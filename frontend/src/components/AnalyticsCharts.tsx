import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Box, Heading, Text, VStack, Card, CardBody } from '@chakra-ui/react';

interface ChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface AnalyticsChartsProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  description?: string;
  height?: number;
  colors?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  data,
  type,
  title,
  description,
  height = 300,
  colors = COLORS,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        );

      default:
        return <Text>Unsupported chart type</Text>;
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Box>
            <Heading size="md" mb={2}>{title}</Heading>
            {description && <Text fontSize="sm" color="gray.600">{description}</Text>}
          </Box>
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Sample data generators
export const generateSampleData = (type: string, count: number = 7): ChartData[] => {
  const data: ChartData[] = [];
  
  switch (type) {
    case 'traffic':
      for (let i = 0; i < count; i++) {
        data.push({
          name: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 1000) + 100,
          sessions: Math.floor(Math.random() * 800) + 50,
          bounceRate: Math.random() * 0.5 + 0.2,
        });
      }
      break;
    
    case 'revenue':
      for (let i = 0; i < count; i++) {
        data.push({
          name: `Month ${i + 1}`,
          value: Math.floor(Math.random() * 50000) + 10000,
          leads: Math.floor(Math.random() * 100) + 10,
          conversions: Math.floor(Math.random() * 20) + 2,
        });
      }
      break;
    
    case 'sources':
      data.push(
        { name: 'Organic Search', value: 45 },
        { name: 'Direct', value: 25 },
        { name: 'Social Media', value: 15 },
        { name: 'Referral', value: 10 },
        { name: 'Email', value: 5 },
      );
      break;
    
    default:
      for (let i = 0; i < count; i++) {
        data.push({
          name: `Point ${i + 1}`,
          value: Math.floor(Math.random() * 100),
        });
      }
  }
  
  return data;
}; 
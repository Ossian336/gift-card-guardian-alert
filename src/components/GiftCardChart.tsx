
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { GiftCard } from "./Dashboard";

interface GiftCardChartProps {
  giftCards: GiftCard[];
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

const GiftCardChart = ({ giftCards }: GiftCardChartProps) => {
  // Group cards by brand and sum balances
  const brandData = giftCards.reduce((acc, card) => {
    const existing = acc.find(item => item.brand === card.brand);
    if (existing) {
      existing.balance += card.balance;
    } else {
      acc.push({ brand: card.brand, balance: card.balance });
    }
    return acc;
  }, [] as { brand: string; balance: number }[]);

  // Sort by balance descending
  brandData.sort((a, b) => b.balance - a.balance);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.payload.brand}</p>
          <p className="text-green-600">${data.value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (giftCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance by Brand</CardTitle>
          <CardDescription>
            Distribution of your gift card balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Add some gift cards to see the chart
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance by Brand</CardTitle>
        <CardDescription>
          Distribution of your gift card balances across different brands
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ brand, balance, percent }) => 
                  `${brand}: $${balance.toFixed(0)} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="balance"
              >
                {brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with totals */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {brandData.map((item, index) => (
            <div key={item.brand} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">
                {item.brand}: <span className="font-semibold">${item.balance.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftCardChart;

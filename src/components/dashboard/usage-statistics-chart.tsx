"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Jan', usage: 4000 },
  { name: 'Feb', usage: 3000 },
  { name: 'Mar', usage: 2000 },
  { name: 'Apr', usage: 2780 },
  { name: 'May', usage: 1890 },
  { name: 'Jun', usage: 2390 },
  { name: 'Jul', usage: 3490 },
];

export function UsageStatisticsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="usage" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
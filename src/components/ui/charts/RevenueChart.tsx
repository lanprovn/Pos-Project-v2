"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

interface PayloadItem {
    value: number;
    name: string;
    payload: {
        name: string;
        total: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: PayloadItem[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-xl border border-black/5">
                <p className="text-sm font-bold mb-1">{label}</p>
                <p className="text-primary font-bold">
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-xl">
                Không có dữ liệu
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar
                    dataKey="total"
                    fill="url(#colorTotal)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                    activeBar={{ fill: '#7c3aed' }}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

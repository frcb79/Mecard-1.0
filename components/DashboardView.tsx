import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { SALES_DATA } from '../constants';
import { getSalesAnalysis } from '../services/geminiService';
import { Button } from './Button';

export const DashboardView: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await getSalesAnalysis(SALES_DATA);
    setInsight(result);
    setLoading(false);
  };

  const totalRevenue = SALES_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = SALES_DATA.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Overview</h2>
                <p className="text-gray-500 mt-1">Weekly Cafeteria Performance</p>
            </div>
            <div className="text-right">
                <span className="text-sm text-gray-500">Last updated: Just now</span>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${(totalRevenue / totalOrders).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Advisor */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-xl font-bold">AI Business Advisor</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4 relative z-10 min-h-[200px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-3">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-indigo-200 text-sm animate-pulse">Analyzing sales patterns...</p>
                        </div>
                    ) : insight ? (
                        <div className="prose prose-invert prose-sm">
                            <p className="whitespace-pre-line text-indigo-50 leading-relaxed">{insight}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-indigo-200">
                            <Sparkles className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-sm">Click the button below to ask Gemini for insights on how to improve your cafeteria sales.</p>
                        </div>
                    )}
                </div>

                <Button 
                    onClick={handleGenerateInsight} 
                    disabled={loading}
                    className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none relative z-10 font-bold"
                >
                    {loading ? 'Thinking...' : 'Generate Insights'}
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
};
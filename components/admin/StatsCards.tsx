// components/admin/StatsCards.tsx
'use client';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import { Star, Users, MessageSquare, ClipboardList, TrendingUp } from 'lucide-react';

interface Stats {
  totalReviews: number;
  avgRating:    number;
  totalMembers: number;
  openRequests: number;
  totalComments:number;
  ratingDist:   { star: number; count: number }[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  index: number;
}

function StatCard({ title, value, icon: Icon, color, sub, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.08 } }}
      whileHover={{ y: -3, boxShadow: `0 8px 32px ${color}20` }}
      className="glass-card p-5 flex items-start gap-4"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-white/50 text-xs font-inter mb-0.5">{title}</p>
        <p className="font-syne font-black text-2xl text-white">{value}</p>
        {sub && <p className="text-white/35 text-xs font-inter mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { title: 'Total Reviews',    value: stats.totalReviews, icon: Star,          color: '#f59e0b', sub: `Avg ${stats.avgRating}★`   },
    { title: 'Registered Members', value: stats.totalMembers, icon: Users,        color: '#2563eb', sub: 'Active accounts'           },
    { title: 'Open Requests',    value: stats.openRequests,  icon: ClipboardList, color: '#f43f5e', sub: 'Awaiting response'         },
    { title: 'Comments',         value: stats.totalComments, icon: MessageSquare, color: '#06b6d4', sub: 'All types'                 },
    { title: 'Average Rating',   value: `${stats.avgRating}★`, icon: TrendingUp,  color: '#10b981', sub: 'Out of 5.0'              },
  ];

  const chartData = stats.ratingDist.map((d) => ({
    name: `${d.star}★`, value: d.count, fill: COLORS[5 - d.star] ?? '#60a5fa',
  }));

  return (
    <div className="space-y-6">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => <StatCard key={c.title} {...c} index={i} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rating distribution bar chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }}
          className="glass-card p-5"
        >
          <h3 className="font-syne font-bold text-white text-sm mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} layout="vertical" barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-syne)' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: '#13131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e0e0f0', fontSize: 12 }}
                cursor={{ fill: 'rgba(37,99,235,0.08)' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radial avg rating */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.45 } }}
          className="glass-card p-5 flex flex-col items-center justify-center"
        >
          <h3 className="font-syne font-bold text-white text-sm mb-2 self-start">Average Rating</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%"
                data={[{ name: 'rating', value: (stats.avgRating / 5) * 100, fill: 'url(#rg)' }]}
                startAngle={90} endAngle={-270}
              >
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.04)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-syne font-black text-3xl gradient-text">{stats.avgRating}</span>
              <span className="text-white/40 text-xs font-inter">/ 5.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

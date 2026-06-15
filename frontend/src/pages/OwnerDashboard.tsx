import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  Star,
  Users,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Mail,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface RatingHistoryItem {
  id: string;
  rating: number;
  user: { name: string; email: string };
  createdAt: string;
}

export const OwnerDashboard: React.FC = () => {
  const [historyPage, setHistoryPage] = useState(1);

  // Fetch all owner stats including paginated ratings
  const { data: ownerData, isLoading: statsLoading } = useQuery({
    queryKey: ['ownerStats', historyPage],
    queryFn: async () => {
      const response = await api.get('/dashboard/store-owner', {
        params: { page: historyPage, limit: 8 },
      });
      return response.data;
    },
  });

  const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const store = ownerData?.store;
  const ratingsData = ownerData?.ratings;

  const ratingBarData = store?.ratingBreakdown?.map((item: any) => ({
    star: `${item.rating}★`,
    count: item.count,
    rating: item.rating,
  })) || [];

  // Build a simple trend from the history data (group by day)
  const trendData = (ratingsData?.data || []).reduce((acc: any[], item: RatingHistoryItem) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.total += item.rating;
      existing.count += 1;
      existing.avgRating = Number((existing.total / existing.count).toFixed(1));
    } else {
      acc.push({ date, total: item.rating, count: 1, avgRating: item.rating });
    }
    return acc;
  }, []).reverse();

  const renderStars = (score: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 stroke-[2px] ${
            s <= score ? 'text-black fill-neo-secondary' : 'text-black/30 fill-white'
          }`}
        />
      ))}
    </div>
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (statsLoading && !ownerData) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 border-4 border-black bg-white shadow-neo-sm shimmer-wrapper" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 border-4 border-black bg-white shadow-neo-sm shimmer-wrapper" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 border-4 border-black bg-white shadow-neo-md shimmer-wrapper" />
          <div className="h-64 border-4 border-black bg-white shadow-neo-md shimmer-wrapper" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-black">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tight text-black m-0">Store Dashboard</h2>
        <p className="text-sm font-bold text-black/70 mt-1 uppercase tracking-wider">
          Performance metrics and customer feedback for your store
        </p>
      </div>

      {/* Store info banner */}
      {store && (
        <div className="p-5 border-4 border-black bg-white shadow-neo-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-14 w-14 border-4 border-black bg-neo-muted flex items-center justify-center text-black font-black text-2xl uppercase shadow-neo-sm shrink-0">
            {store.name?.charAt(0) ?? 'S'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black uppercase tracking-tight text-black m-0">{store.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-black/70 font-bold uppercase tracking-wider text-xs">
                <Mail className="h-3.5 w-3.5 text-black stroke-[2.5px]" /> {store.email}
              </div>
              <div className="flex items-center gap-1.5 text-black/70 font-bold uppercase tracking-wider text-xs">
                <MapPin className="h-3.5 w-3.5 text-black stroke-[2.5px]" />
                <span className="truncate max-w-xs">{store.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {store && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 border-4 border-black bg-white shadow-neo-sm flex items-center gap-4">
            <div className="p-3 border-4 border-black bg-neo-secondary text-black shadow-neo-sm shrink-0">
              <Star className="h-5 w-5 text-black fill-current stroke-[2px]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-black/60 font-black">Avg Rating</p>
              <p className="text-3xl font-black text-black mt-0.5">
                {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
              </p>
            </div>
          </div>

          <div className="p-5 border-4 border-black bg-white shadow-neo-sm flex items-center gap-4">
            <div className="p-3 border-4 border-black bg-neo-muted text-black shadow-neo-sm shrink-0">
              <Users className="h-5 w-5 text-black stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-black/60 font-black">Total Reviews</p>
              <p className="text-3xl font-black text-black mt-0.5">{store.totalRatings}</p>
            </div>
          </div>

          <div className="p-5 border-4 border-black bg-white shadow-neo-sm flex items-center gap-4">
            <div className="p-3 border-4 border-black bg-neo-accent text-black shadow-neo-sm shrink-0">
              <Award className="h-5 w-5 text-black stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-black/60 font-black">5-Star Reviews</p>
              <p className="text-3xl font-black text-black mt-0.5">
                {store.ratingBreakdown?.find((r: any) => r.rating === 5)?.count ?? 0}
              </p>
            </div>
          </div>

          <div className="p-5 border-4 border-black bg-white shadow-neo-sm flex items-center gap-4">
            <div className="p-3 border-4 border-black bg-neo-secondary text-black shadow-neo-sm shrink-0">
              <TrendingUp className="h-5 w-5 text-black stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-black/60 font-black">Satisfaction</p>
              <p className="text-2xl font-black text-black mt-0.5">
                {store.averageRating >= 4 ? '🔥 High' : store.averageRating >= 2.5 ? '👍 Good' : store.totalRatings === 0 ? '—' : '📉 Low'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {store && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Trend from History */}
          <div className="p-6 border-4 border-black bg-white shadow-neo-md">
            <h4 className="text-base font-black uppercase tracking-wider text-black mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-black stroke-[2.5px]" /> Recent Rating Trend
            </h4>
            {trendData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#000" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <YAxis stroke="#000" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#000', borderWidth: '4px', borderRadius: '0px' }}
                      labelStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgRating"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#ratingGrad)"
                      name="Avg Rating"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-black/50 text-sm font-bold uppercase tracking-wider">
                No ratings data to display yet
              </div>
            )}
          </div>

          {/* Rating Distribution Bar Chart */}
          <div className="p-6 border-4 border-black bg-white shadow-neo-md">
            <h4 className="text-base font-black uppercase tracking-wider text-black mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-black fill-neo-secondary stroke-[2.5px]" /> Rating Distribution
            </h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" opacity={0.2} />
                  <XAxis dataKey="star" stroke="#000" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis stroke="#000" allowDecimals={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#000', borderWidth: '4px', borderRadius: '0px' }}
                    labelFormatter={(label) => `${label} Ratings`}
                  />
                  <Bar dataKey="count" radius={[0, 0, 0, 0]} name="Reviews">
                    {ratingBarData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Rating History Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-2">
          <Calendar className="h-5 w-5 text-black stroke-[2.5px]" /> Customer Reviews
        </h3>

        {statsLoading ? (
          <div className="h-64 border-4 border-black bg-white shadow-neo-md shimmer-wrapper" />
        ) : !ratingsData?.data?.length ? (
          <div className="flex flex-col items-center justify-center border-4 border-black bg-white p-16 shadow-neo-sm gap-4 text-black text-center">
            <Star className="h-10 w-10 text-black stroke-[2px]" />
            <p className="text-xl font-black uppercase tracking-wider">No ratings received yet</p>
            <p className="text-sm font-bold text-black/60">Customer reviews will appear here once they rate your store</p>
          </div>
        ) : (
          <div className="border-4 border-black bg-white shadow-neo-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-black">
                <thead className="bg-neo-muted/30 border-b-4 border-black text-xs font-black uppercase tracking-wider text-black">
                  <tr>
                    <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Customer</th>
                    <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Email</th>
                    <th className="px-6 py-4 border-r-4 border-black last:border-r-0">Rating</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-black">
                  {ratingsData.data.map((item: RatingHistoryItem) => (
                    <tr key={item.id} className="hover:bg-neo-secondary/10 transition-colors">
                      <td className="px-6 py-4 border-r-4 border-black last:border-r-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 border-2 border-black bg-neo-secondary flex items-center justify-center text-black font-black text-xs uppercase shrink-0">
                            {item.user.name.charAt(0)}
                          </div>
                          <span className="font-black text-black uppercase tracking-wide">{item.user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black/70 font-bold border-r-4 border-black last:border-r-0">{item.user.email}</td>
                      <td className="px-6 py-4 border-r-4 border-black last:border-r-0">{renderStars(item.rating)}</td>
                      <td className="px-6 py-4 text-black/60 font-bold text-xs">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ratingsData.meta?.totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t-4 border-black bg-neo-muted/10">
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  Page {ratingsData.meta.page} of {ratingsData.meta.totalPages} ({ratingsData.meta.total} reviews)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => p - 1)}
                    className="p-1.5 border-2 border-black bg-white text-black disabled:opacity-40 hover:bg-neo-secondary hover:shadow-neo-sm transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 stroke-[3px]" />
                  </button>
                  <button
                    disabled={historyPage >= ratingsData.meta.totalPages}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="p-1.5 border-2 border-black bg-white text-black disabled:opacity-40 hover:bg-neo-secondary hover:shadow-neo-sm transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4 stroke-[3px]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


import React from 'react';
import { Laptop } from '../types';
import { getStats, getAveragePriceByCompany, getRamDistribution, formatCurrency } from '../utils';
import { BarChart3, Laptop2, IndianRupee, TrendingUp, Cpu } from 'lucide-react';

interface DashboardProps {
  data: Laptop[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const stats = getStats(data);
  const companyPrices = getAveragePriceByCompany(data).slice(0, 8); // Top 8
  const ramDist = getRamDistribution(data);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-lg hover:bg-slate-800/60 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Laptop2 size={24} className="text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalLaptops}</div>
          <div className="text-sm text-slate-400">Unique models tracked</div>
        </div>
        
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-lg hover:bg-slate-800/60 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <IndianRupee size={24} className="text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full">Avg Price</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">{formatCurrency(stats.avgPrice)}</div>
          <div className="text-sm text-slate-400">Across all categories</div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-lg hover:bg-slate-800/60 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
              <BarChart3 size={24} className="text-violet-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full">Market Leader</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.mostPopularBrand}</div>
          <div className="text-sm text-slate-400">Most frequent brand</div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-lg hover:bg-slate-800/60 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20 transition-colors">
              <TrendingUp size={24} className="text-rose-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full">Top Tier</span>
          </div>
          <div className="text-xl font-bold text-white mb-1 truncate" title={stats.mostExpensive ? stats.mostExpensive.price.toString() : ''}>
             {stats.mostExpensive ? formatCurrency(stats.mostExpensive.price) : 'N/A'}
          </div>
          <div className="text-sm text-slate-400 truncate w-full" title={stats.mostExpensive ? `${stats.mostExpensive.company} ${stats.mostExpensive.typeName}` : ''}>
            {stats.mostExpensive ? `${stats.mostExpensive.company} ${stats.mostExpensive.typeName}` : '-'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Pricing Chart */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <IndianRupee className="w-5 h-5 mr-2 text-emerald-400" />
            Avg. Price by Brand
          </h3>
          <div className="space-y-5">
            {companyPrices.map((item, index) => (
              <div key={item.label} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className="text-slate-400 font-mono">{formatCurrency(item.value)}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out group-hover:from-emerald-500 group-hover:to-emerald-300" 
                    style={{ 
                      width: `${(item.value / (companyPrices[0]?.value || 1)) * 100}%`,
                      transitionDelay: `${index * 50}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* RAM Distribution */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-indigo-400" />
              RAM Configuration Market Share
            </h3>
            <div className="flex items-end justify-between h-48 space-x-2">
              {ramDist.map((item, index) => {
                const maxVal = Math.max(...ramDist.map(r => r.value));
                const heightPct = (item.value / maxVal) * 100;
                return (
                  <div key={item.label} className="flex-1 flex flex-col justify-end group">
                    <div 
                      className="w-full bg-indigo-500/80 hover:bg-indigo-400 rounded-t-sm transition-all duration-700 ease-out relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                        {item.value} units
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 text-center mt-2 font-medium">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights Text */}
          <div className="bg-gradient-to-br from-slate-800/60 to-indigo-900/20 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Dataset Highlights</h3>
            <div className="space-y-4 text-slate-300">
              <p className="text-sm leading-relaxed border-l-2 border-indigo-500 pl-4">
                The dataset is dominated by <span className="text-white font-semibold">{stats.mostPopularBrand}</span>, representing a significant portion of the market share.
              </p>
              <p className="text-sm leading-relaxed border-l-2 border-emerald-500 pl-4">
                Premium workstations reach up to <span className="text-white font-semibold">{formatCurrency(stats.mostExpensive?.price || 0)}</span>, while budget options start as low as <span className="text-white font-semibold">{formatCurrency(Math.min(...data.map(d => d.price)))}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

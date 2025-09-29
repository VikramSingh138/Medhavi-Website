import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

const UserStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/analytics`);
        setStats({
          totalUsers: response.data.totalUsers,
          todayUsers: response.data.todayUsers,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (stats.isLoading) {
    return (
      <div className="flex items-center space-x-2 text-cyan-300/80">
        <div className="animate-pulse w-4 h-4 bg-cyan-300/50 rounded"></div>
        <span className="text-sm">Loading stats...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
      {/* Total Users */}
      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
        <Users className="h-5 w-5 text-cyan-300" />
        <div className="text-center sm:text-left">
          <div className="text-lg font-bold text-white">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-xs text-cyan-200/80">Total Users</div>
        </div>
      </div>

      {/* Today's Users */}
      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
        <Clock className="h-5 w-5 text-emerald-300" />
        <div className="text-center sm:text-left">
          <div className="text-lg font-bold text-white">
            {stats.todayUsers.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-200/80">Today</div>
        </div>
      </div>

      {/* Active indicator */}
      <div className="flex items-center space-x-1 text-xs text-cyan-300/80">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span>Live</span>
      </div>
    </div>
  );
};

export default UserStats;
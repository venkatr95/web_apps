"use client";

import { AnalyticsSkeleton } from "@/components/admin/SkeletonLoaders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  Package,
  PieChart,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: number[];
  };
  orders: {
    total: number;
    change: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  customers: {
    total: number;
    change: number;
    active: number;
    new: number;
  };
  products: {
    total: number;
    change: number;
    lowStock: number;
    outOfStock: number;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    action: string;
    time: string;
    value: string;
  }>;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    format = "number",
    subtitle,
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    format?: "number" | "currency";
    subtitle?: string;
  }) => {
    const isPositive = change >= 0;
    const formatValue = (val: number) => {
      if (format === "currency") return `$${val.toLocaleString()}`;
      return val.toLocaleString();
    };

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-shop_light_blue/20 hover:border-shop_light_blue/40 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${color}`}></div>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-light-color flex items-center justify-between">
            {title}
            <Icon className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-dark-color">
              {formatValue(value)}
            </div>
            {subtitle && (
              <div className="text-xs text-light-color">{subtitle}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {isPositive ? "+" : ""}
              {change}%
            </Badge>
            <span className="text-xs text-light-color">vs last period</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-color flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-shop_light_blue" />
            Business Analytics
          </h1>
          <p className="text-light-color mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="border-shop_light_blue/20 hover:border-shop_light_blue"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <StatCard
            title="Total Revenue"
            value={analytics?.revenue?.total || 0}
            change={analytics?.revenue?.change || 0}
            icon={DollarSign}
            color="from-blue-500 to-emerald-600"
            format="currency"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatCard
            title="Total Orders"
            value={analytics?.orders?.total || 0}
            change={analytics?.orders?.change || 0}
            icon={ShoppingCart}
            color="from-blue-500 to-cyan-600"
            subtitle={`${analytics?.orders?.pending || 0} pending`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatCard
            title="Total Customers"
            value={analytics?.customers?.total || 0}
            change={analytics?.customers?.change || 0}
            icon={Users}
            color="from-purple-500 to-pink-600"
            subtitle={`${analytics?.customers?.new || 0} new this period`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatCard
            title="Total Products"
            value={analytics?.products?.total || 0}
            change={analytics?.products?.change || 0}
            icon={Package}
            color="from-orange-500 to-red-600"
            subtitle={`${analytics?.products?.lowStock || 0} low stock`}
          />
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-shop_light_blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-shop_light_blue" />
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <Badge variant="outline">
                    {analytics?.orders?.completed || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <Badge variant="outline">
                    {analytics?.orders?.pending || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Cancelled</span>
                  </div>
                  <Badge variant="outline">
                    {analytics?.orders?.cancelled || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="border-shop_light_blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-shop_light_blue" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topProducts?.slice(0, 5).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-shop_light_bg rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm text-dark-color">
                        {product.name}
                      </div>
                      <div className="text-xs text-light-color">
                        {product.sales} sales
                      </div>
                    </div>
                    <Badge className="bg-shop_light_blue/20 text-shop_dark_blue">
                      ${product.revenue.toLocaleString()}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-6 text-light-color">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card className="border-shop_light_blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-shop_light_blue" />
              Recent Business Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.recentActivity?.slice(0, 8).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-shop_light_blue/10 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-shop_light_blue rounded-full"></div>
                    <span className="text-sm text-dark-color">
                      {activity.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.value}
                    </Badge>
                    <span className="text-xs text-light-color">
                      {activity.time}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-6 text-light-color">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;

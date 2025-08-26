import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, PiggyBank, TrendingUp, Target, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface FinancialData {
  totalSalary: number;
  totalExpenses: number;
  totalSavings: number;
  currentMonth: string;
}

interface ChartData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export const FinancialOverview = () => {
  const [data, setData] = useState<FinancialData>({
    totalSalary: 0,
    totalExpenses: 0,
    totalSavings: 0,
    currentMonth: ''
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    if (!user) return;

    setLoading(true);
    
    // Get current month's salary
    const currentMonth = new Date().toLocaleDateString('id-ID', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Fetch total salary for current month
    const { data: salaryData } = await supabase
      .from('salaries')
      .select('amount')
      .eq('user_id', user.id)
      .ilike('month', `%${currentMonth}%`);

    // Fetch total expenses for current month
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('amount, salaries!inner(month)')
      .eq('user_id', user.id)
      .ilike('salaries.month', `%${currentMonth}%`);

    // Fetch total savings
    const { data: savingsData } = await supabase
      .from('savings')
      .select('amount, expenses!inner(user_id)')
      .eq('expenses.user_id', user.id);

    const totalSalary = salaryData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const totalExpenses = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const totalSavings = savingsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    setData({
      totalSalary,
      totalExpenses,
      totalSavings,
      currentMonth
    });

    // Mock chart data for demonstration
    const mockChartData = [
      { month: 'Jan', income: 5000000, expenses: 3500000, savings: 1000000 },
      { month: 'Feb', income: 5200000, expenses: 3800000, savings: 800000 },
      { month: 'Mar', income: 4800000, expenses: 3200000, savings: 1200000 },
      { month: 'Apr', income: 5500000, expenses: 4000000, savings: 900000 },
      { month: 'May', income: 5300000, expenses: 3600000, savings: 1100000 },
      { month: 'Jun', income: totalSalary || 5600000, expenses: totalExpenses || 3900000, savings: totalSavings || 1000000 },
    ];
    
    setChartData(mockChartData);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const remainingBudget = data.totalSalary - data.totalExpenses;
  const expensePercentage = data.totalSalary > 0 ? (data.totalExpenses / data.totalSalary) * 100 : 0;
  const savingsRate = data.totalSalary > 0 ? (data.totalSavings / data.totalSalary) * 100 : 0;

  const getInsight = () => {
    if (expensePercentage >= 90) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
        title: "Budget Alert!",
        message: "You've spent 90% of your income. Consider reducing non-essential expenses.",
        type: "warning"
      };
    } else if (savingsRate >= 20) {
      return {
        icon: <Target className="w-5 h-5 text-success" />,
        title: "Excellent Savings!",
        message: "You're saving above the recommended 20% rate. Keep up the great work!",
        type: "success"
      };
    } else if (expensePercentage <= 70) {
      return {
        icon: <Zap className="w-5 h-5 text-primary" />,
        title: "Great Control!",
        message: "Your spending is well controlled. Consider increasing your savings rate.",
        type: "info"
      };
    } else {
      return {
        icon: <TrendingUp className="w-5 h-5 text-accent" />,
        title: "Room for Improvement",
        message: "Try to reduce expenses and increase your savings for better financial health.",
        type: "neutral"
      };
    }
  };

  const insight = getInsight();

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded w-32 mb-2" />
                <div className="h-3 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-success/20 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(data.totalSalary)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.currentMonth || 'Current month'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(data.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expensePercentage.toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(data.totalSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-accent'}`}>
              {formatCurrency(remainingBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget < 0 ? 'Over budget!' : 'Remaining this month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Trend */}
        <Card className="border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Financial Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Progress */}
        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-accent" />
              Savings Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="savings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health & Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Insights */}
        <Card className="lg:col-span-2 border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {insight.icon}
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-elegant border border-border/50">
                <h4 className="font-semibold mb-2">{insight.title}</h4>
                <p className="text-muted-foreground">{insight.message}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expense Ratio</span>
                    <span className="text-sm text-muted-foreground">{expensePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={expensePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">Recommended: Below 80%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Savings Rate</span>
                    <span className="text-sm text-muted-foreground">{savingsRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={savingsRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">Recommended: Above 20%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Add Income
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingDown className="w-4 h-4 mr-2" />
                Record Expense
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Set Budget Goal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
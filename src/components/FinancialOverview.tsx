import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, PiggyBank, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FinancialData {
  totalSalary: number;
  totalExpenses: number;
  totalSavings: number;
  currentMonth: string;
}

export const FinancialOverview = () => {
  const [data, setData] = useState<FinancialData>({
    totalSalary: 0,
    totalExpenses: 0,
    totalSavings: 0,
    currentMonth: ''
  });
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
    
    setLoading(false);
  };

  const remainingBudget = data.totalSalary - data.totalExpenses;
  const expensePercentage = data.totalSalary > 0 ? (data.totalExpenses / data.totalSalary) * 100 : 0;

  const getInsight = () => {
    if (expensePercentage >= 90) {
      return "⚠️ Pengeluaran Anda sudah mencapai 90% dari gaji! Pertimbangkan untuk mengurangi pengeluaran non-esensial.";
    } else if (expensePercentage >= 80) {
      return "⚡ Pengeluaran sudah 80% dari gaji. Coba kurangi biaya hiburan atau belanja tidak penting.";
    } else if (expensePercentage >= 50) {
      return "👍 Pengeluaran masih dalam batas wajar. Pertahankan pola pengelolaan keuangan ini.";
    } else if (data.totalSavings > 0) {
      return "🎉 Bagus! Anda memiliki tabungan dan pengeluaran terkendali dengan baik.";
    } else {
      return "💡 Mulai sisihkan sebagian gaji untuk tabungan masa depan.";
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gaji</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {data.totalSalary.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Bulan {data.currentMonth || 'ini'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {data.totalExpenses.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              {expensePercentage.toFixed(1)}% dari gaji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tabungan</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {data.totalSavings.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Akumulasi tabungan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-foreground'}`}>
              Rp {remainingBudget.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget < 0 ? 'Overspending!' : 'Tersisa bulan ini'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Insight Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{getInsight()}</p>
        </CardContent>
      </Card>
    </div>
  );
};
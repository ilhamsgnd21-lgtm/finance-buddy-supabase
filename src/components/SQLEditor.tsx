import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Database, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SQLEditor = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { toast } = useToast();

  const queryTemplates = {
    monthlyExpenses: `-- Pengeluaran bulanan
SELECT 
  DATE_TRUNC('month', date) as bulan,
  SUM(amount) as total_pengeluaran,
  COUNT(*) as jumlah_transaksi
FROM expenses 
WHERE user_id = auth.uid()
GROUP BY DATE_TRUNC('month', date)
ORDER BY bulan DESC;`,

    categoryAnalysis: `-- Analisis kategori pengeluaran
SELECT 
  category,
  SUM(amount) as total,
  COUNT(*) as jumlah,
  ROUND(AVG(amount), 2) as rata_rata
FROM expenses 
WHERE user_id = auth.uid()
GROUP BY category
ORDER BY total DESC;`,

    savingsProgress: `-- Progress tabungan
SELECT 
  DATE_TRUNC('month', e.date) as bulan,
  SUM(s.amount) as total_tabungan,
  COUNT(s.id) as transaksi_tabungan
FROM expenses e
JOIN savings s ON e.id = s.expense_id
WHERE e.user_id = auth.uid()
GROUP BY DATE_TRUNC('month', e.date)
ORDER BY bulan DESC;`,

    incomeVsExpenses: `-- Perbandingan pendapatan vs pengeluaran
WITH monthly_income AS (
  SELECT 
    month,
    SUM(amount) as pendapatan
  FROM salaries 
  WHERE user_id = auth.uid()
  GROUP BY month
),
monthly_expenses AS (
  SELECT 
    TO_CHAR(date, 'YYYY-MM') as month,
    SUM(amount) as pengeluaran
  FROM expenses 
  WHERE user_id = auth.uid()
  GROUP BY TO_CHAR(date, 'YYYY-MM')
)
SELECT 
  COALESCE(i.month, e.month) as bulan,
  COALESCE(i.pendapatan, 0) as pendapatan,
  COALESCE(e.pengeluaran, 0) as pengeluaran,
  COALESCE(i.pendapatan, 0) - COALESCE(e.pengeluaran, 0) as selisih
FROM monthly_income i
FULL OUTER JOIN monthly_expenses e ON i.month = e.month
ORDER BY bulan DESC;`,

    topCategories: `-- Top 5 kategori pengeluaran bulan ini
SELECT 
  category,
  SUM(amount) as total,
  ROUND((SUM(amount) * 100.0 / (
    SELECT SUM(amount) 
    FROM expenses 
    WHERE user_id = auth.uid() 
    AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  )), 2) as persentase
FROM expenses 
WHERE user_id = auth.uid()
AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category
ORDER BY total DESC
LIMIT 5;`,

    dailySpending: `-- Pengeluaran harian minggu ini
SELECT 
  DATE(date) as tanggal,
  SUM(amount) as total_harian,
  STRING_AGG(category || ': ' || amount::text, ', ') as detail
FROM expenses 
WHERE user_id = auth.uid()
AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(date)
ORDER BY tanggal DESC;`
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Silakan masukkan query SQL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_query: query 
      });

      if (error) throw error;

      setResults(data || []);
      toast({
        title: "Query berhasil dijalankan",
        description: `Menampilkan ${data?.length || 0} baris hasil`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('SQL Error:', error);
      toast({
        title: "Error menjalankan query",
        description: error.message || "Terjadi kesalahan saat menjalankan query",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (templateKey: string) => {
    setQuery(queryTemplates[templateKey as keyof typeof queryTemplates]);
    setSelectedTemplate(templateKey);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-elegant">
        <CardHeader className="bg-gradient-elegant">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            SQL Editor - Analisis Keuangan
          </CardTitle>
          <CardDescription>
            Buat query SQL kustom untuk analisis keuangan mendalam dan otomasi perhitungan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Template Query</TabsTrigger>
              <TabsTrigger value="custom">Query Kustom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex items-start gap-3"
                  onClick={() => useTemplate('monthlyExpenses')}
                >
                  <TrendingUp className="h-4 w-4 mt-1 text-primary" />
                  <div>
                    <div className="font-medium">Pengeluaran Bulanan</div>
                    <div className="text-xs text-muted-foreground">Total pengeluaran per bulan</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex items-start gap-3"
                  onClick={() => useTemplate('categoryAnalysis')}
                >
                  <PieChart className="h-4 w-4 mt-1 text-accent" />
                  <div>
                    <div className="font-medium">Analisis Kategori</div>
                    <div className="text-xs text-muted-foreground">Breakdown per kategori</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex items-start gap-3"
                  onClick={() => useTemplate('savingsProgress')}
                >
                  <DollarSign className="h-4 w-4 mt-1 text-success" />
                  <div>
                    <div className="font-medium">Progress Tabungan</div>
                    <div className="text-xs text-muted-foreground">Tracking tabungan bulanan</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex items-start gap-3"
                  onClick={() => useTemplate('incomeVsExpenses')}
                >
                  <BarChart3 className="h-4 w-4 mt-1 text-warning" />
                  <div>
                    <div className="font-medium">Pendapatan vs Pengeluaran</div>
                    <div className="text-xs text-muted-foreground">Perbandingan monthly cash flow</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex items-start gap-3"
                  onClick={() => useTemplate('topCategories')}
                >
                  <Calculator className="h-4 w-4 mt-1 text-destructive" />
                  <div>
                    <div className="font-medium">Top Kategori</div>
                    <div className="text-xs text-muted-foreground">5 kategori pengeluaran terbesar</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex items-start gap-3"
                  onClick={() => useTemplate('dailySpending')}
                >
                  <TrendingUp className="h-4 w-4 mt-1 text-primary-glow" />
                  <div>
                    <div className="font-medium">Pengeluaran Harian</div>
                    <div className="text-xs text-muted-foreground">Detail pengeluaran 7 hari terakhir</div>
                  </div>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Query SQL:</label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Masukkan query SQL di sini..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>

          {selectedTemplate && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Query yang akan dijalankan:</label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={executeQuery} 
              disabled={loading || !query.trim()}
              variant="elegant"
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {loading ? 'Menjalankan...' : 'Jalankan Query'}
            </Button>
            
            {query && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSelectedTemplate('');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <BarChart3 className="h-5 w-5" />
              Hasil Query
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{results.length} baris</Badge>
              {results.length > 0 && (
                <Badge variant="outline">{Object.keys(results[0]).length} kolom</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    {results.length > 0 && Object.keys(results[0]).map((key) => (
                      <th key={key} className="border border-border p-3 text-left font-medium text-sm">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="border border-border p-3 text-sm">
                          {typeof value === 'number' && (value.toString().includes('.') || value > 1000) 
                            ? formatCurrency(value)
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SQLEditor;
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, DollarSign, TrendingDown, PiggyBank } from 'lucide-react';
import { SalaryForm } from '@/components/SalaryForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { FinancialOverview } from '@/components/FinancialOverview';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

const Dashboard = () => {
  const { signOut, user, username } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Manajemen Keuangan</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">@{username}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Input Data
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              Laporan
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="input" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Input Gaji</CardTitle>
                  <CardDescription>
                    Masukkan gaji bulanan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalaryForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input Pengeluaran</CardTitle>
                  <CardDescription>
                    Catat pengeluaran harian Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Keuangan</CardTitle>
                <CardDescription>
                  Analisis dan insight keuangan Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fitur laporan dalam pengembangan...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <ChangePasswordForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, DollarSign, TrendingDown, PiggyBank, Calculator, BarChart3, Target, CreditCard, Wallet, Settings } from 'lucide-react';
import { SalaryForm } from '@/components/SalaryForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { FinancialOverview } from '@/components/FinancialOverview';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import SQLEditor from '@/components/SQLEditor';
import { FinancialReports } from '@/components/FinancialReports';
import { BudgetPlanner } from '@/components/BudgetPlanner';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { GoalTracker } from '@/components/GoalTracker';

const Dashboard = () => {
  const { signOut, user, username } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-elegant">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FinanceFlow
              </h1>
              <p className="text-sm text-muted-foreground">Smart Financial Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Welcome back!</p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="hover:bg-destructive hover:text-destructive-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-card/50 backdrop-blur-sm border border-border/50 shadow-elegant">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Input</span>
            </TabsTrigger>
            <TabsTrigger value="tracker" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingDown className="w-4 h-4" />
              <span className="hidden sm:inline">Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PiggyBank className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="input" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="bg-gradient-elegant rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <DollarSign className="w-5 h-5" />
                    Income Management
                  </CardTitle>
                  <CardDescription>
                    Track your monthly income sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SalaryForm />
                </CardContent>
              </Card>

              <Card className="border-accent/20 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="bg-gradient-elegant rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <TrendingDown className="w-5 h-5" />
                    Expense Tracking
                  </CardTitle>
                  <CardDescription>
                    Record your daily expenses and categorize them
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ExpenseForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracker" className="mt-6">
            <ExpenseTracker />
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <BudgetPlanner />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GoalTracker />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              <FinancialReports />
              <Card className="border-primary/20 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Calculator className="w-5 h-5" />
                    Advanced Analytics
                  </CardTitle>
                  <CardDescription>
                    Custom SQL queries for deep financial insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SQLEditor />
                </CardContent>
              </Card>
            </div>
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
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  color: string;
}

export const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Food & Dining',
      budgetAmount: 1500000,
      spentAmount: 1200000,
      period: 'monthly',
      color: '#ef4444'
    },
    {
      id: '2',
      category: 'Transportation',
      budgetAmount: 800000,
      spentAmount: 650000,
      period: 'monthly',
      color: '#3b82f6'
    },
    {
      id: '3',
      category: 'Entertainment',
      budgetAmount: 500000,
      spentAmount: 320000,
      period: 'monthly',
      color: '#8b5cf6'
    },
    {
      id: '4',
      category: 'Shopping',
      budgetAmount: 1000000,
      spentAmount: 1100000,
      period: 'monthly',
      color: '#f59e0b'
    }
  ]);

  const [newBudget, setNewBudget] = useState({
    category: '',
    budgetAmount: '',
    period: 'monthly' as const
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (percentage >= 80) return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="destructive">Over Budget</Badge>;
    if (percentage >= 80) return <Badge variant="secondary" className="bg-warning/10 text-warning">Near Limit</Badge>;
    return <Badge variant="secondary" className="bg-success/10 text-success">On Track</Badge>;
  };

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.budgetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const colors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      budgetAmount: parseFloat(newBudget.budgetAmount),
      spentAmount: 0,
      period: newBudget.period,
      color: randomColor
    };

    setBudgets([...budgets, budget]);
    setNewBudget({ category: '', budgetAmount: '', period: 'monthly' });
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Budget created successfully!"
    });
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(budget => budget.id !== id));
    toast({
      title: "Success",
      description: "Budget deleted successfully!"
    });
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget Planner</h2>
          <p className="text-muted-foreground">Set and track your spending limits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a specific category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Food & Dining"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000000"
                  value={newBudget.budgetAmount}
                  onChange={(e) => setNewBudget({ ...newBudget, budgetAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={newBudget.period} onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => setNewBudget({ ...newBudget, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBudget} className="w-full">
                Create Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Summary */}
      <Card className="border-primary/20 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Overall Budget Summary
          </CardTitle>
          <CardDescription>Your total budget performance this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalBudget)}</div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{formatCurrency(totalBudget - totalSpent)}</div>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
          const remaining = budget.budgetAmount - budget.spentAmount;

          return (
            <Card key={budget.id} className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: budget.color }}
                    />
                    {budget.category}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(percentage)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {budget.period}
                  </Badge>
                  {getStatusBadge(percentage)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className="font-semibold">{formatCurrency(budget.spentAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-semibold">{formatCurrency(budget.budgetAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-semibold ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No budgets yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first budget to start tracking your spending limits
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
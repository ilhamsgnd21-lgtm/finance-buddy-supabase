import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Target, Plus, Edit, Trash2, Calendar, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'savings' | 'investment' | 'debt' | 'purchase' | 'emergency';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export const GoalTracker = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Emergency Fund',
      description: 'Build an emergency fund covering 6 months of expenses',
      targetAmount: 30000000,
      currentAmount: 18000000,
      targetDate: '2024-12-31',
      category: 'emergency',
      priority: 'high',
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'New Laptop',
      description: 'Save for a new MacBook Pro for work',
      targetAmount: 25000000,
      currentAmount: 15000000,
      targetDate: '2024-06-30',
      category: 'purchase',
      priority: 'medium',
      status: 'active',
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      title: 'Investment Portfolio',
      description: 'Build a diversified investment portfolio',
      targetAmount: 50000000,
      currentAmount: 12000000,
      targetDate: '2025-12-31',
      category: 'investment',
      priority: 'medium',
      status: 'active',
      createdAt: '2024-01-15'
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'savings' as const,
    priority: 'medium' as const
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

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'savings': return '💰';
      case 'investment': return '📈';
      case 'debt': return '💳';
      case 'purchase': return '🛍️';
      case 'emergency': return '🚨';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'savings': return 'bg-green-100 text-green-800';
      case 'investment': return 'bg-blue-100 text-blue-800';
      case 'debt': return 'bg-red-100 text-red-800';
      case 'purchase': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.targetDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      priority: newGoal.priority,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      category: 'savings',
      priority: 'medium'
    });
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Goal created successfully!"
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    toast({
      title: "Success",
      description: "Goal deleted successfully!"
    });
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(goals.map(goal => 
      goal.id === id 
        ? { ...goal, currentAmount: Math.max(0, goal.currentAmount + amount) }
        : goal
    ));
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Goal Tracker</h2>
          <p className="text-muted-foreground">Set and track your financial goals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new financial goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Target Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10000000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Target Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value: Goal['category']) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="debt">Debt Payment</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="emergency">Emergency Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newGoal.priority} onValueChange={(value: Goal['priority']) => setNewGoal({ ...newGoal, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      <Card className="border-primary/20 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Overall Progress
          </CardTitle>
          <CardDescription>Your total progress across all active goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalCurrentAmount)}</div>
              <p className="text-sm text-muted-foreground">Current Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{formatCurrency(totalTargetAmount)}</div>
              <p className="text-sm text-muted-foreground">Target Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{overallProgress.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Active Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Goals ({activeGoals.length})</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysRemaining = calculateDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;

            return (
              <Card key={goal.id} className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription className="text-sm">{goal.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(goal.category)}>
                      {goal.category}
                    </Badge>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-semibold">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-semibold">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={isOverdue ? 'text-destructive' : 'text-muted-foreground'}>
                          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, 100000)}
                        className="flex-1"
                      >
                        +100K
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, 500000)}
                        className="flex-1"
                      >
                        +500K
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, -100000)}
                        className="flex-1"
                      >
                        -100K
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {activeGoals.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No active goals</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create your first financial goal to start tracking your progress
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Completed Goals ({completedGoals.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-success/20 bg-success/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </div>
                  <Badge className="w-fit bg-success/10 text-success">Completed</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                  <p className="font-semibold text-success">{formatCurrency(goal.targetAmount)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
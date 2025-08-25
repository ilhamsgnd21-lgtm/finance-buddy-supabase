import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Salary {
  id: string;
  month: string;
  amount: number;
}

export const ExpenseForm = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [salaryId, setSalaryId] = useState('');
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSalaries();
    }
  }, [user]);

  const fetchSalaries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSalaries(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !salaryId) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        salary_id: salaryId,
        category,
        amount: parseFloat(amount)
      });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengeluaran",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: category.toLowerCase().includes('tabungan') 
          ? "Pengeluaran berhasil disimpan dan otomatis masuk ke tabungan" 
          : "Pengeluaran berhasil disimpan",
      });
      setCategory('');
      setAmount('');
      setSalaryId('');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="salary">Pilih Gaji Bulan</Label>
        <Select value={salaryId} onValueChange={setSalaryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih bulan gaji" />
          </SelectTrigger>
          <SelectContent>
            {salaries.map((salary) => (
              <SelectItem key={salary.id} value={salary.id}>
                {salary.month} - Rp {salary.amount.toLocaleString('id-ID')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          type="text"
          placeholder="Contoh: makan, transport, tabungan"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          *Gunakan kata "tabungan" untuk otomatis masuk ke kategori tabungan
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expense-amount">Jumlah</Label>
        <Input
          id="expense-amount"
          type="number"
          placeholder="50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading || !salaryId}>
        {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
      </Button>
    </form>
  );
};
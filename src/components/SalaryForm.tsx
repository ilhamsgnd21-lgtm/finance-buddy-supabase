import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SalaryForm = () => {
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('salaries')
      .insert({
        user_id: user.id,
        month,
        amount: parseFloat(amount)
      });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan gaji",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Gaji berhasil disimpan",
      });
      setMonth('');
      setAmount('');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="month">Bulan</Label>
        <Input
          id="month"
          type="text"
          placeholder="Contoh: Januari 2024"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah Gaji</Label>
        <Input
          id="amount"
          type="number"
          placeholder="5000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Gaji"}
      </Button>
    </form>
  );
};
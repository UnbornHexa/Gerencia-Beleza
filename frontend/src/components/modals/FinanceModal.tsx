import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';

interface FinanceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'income' | 'expense';
  finance?: any;
}

const expenseCategories = [
  'Saúde',
  'Educação',
  'Alimentação',
  'Gastos Pessoais',
  'Trabalho',
  'Veículo',
  'Lazer',
  'Casa',
];

export default function FinanceModal({ open, onClose, onSuccess, type, finance }: FinanceModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    serviceId: '',
  });

  useEffect(() => {
    if (open) {
      if (finance) {
        setFormData({
          name: finance.name || '',
          amount: finance.amount || 0,
          date: finance.date ? new Date(finance.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: finance.category || '',
          serviceId: finance.serviceId?._id || finance.serviceId || '',
        });
      } else {
        setFormData({
          name: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          category: '',
          serviceId: '',
        });
      }
      if (type === 'income') {
        loadServices();
      }
    }
  }, [open, finance, type]);

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        type,
        name: formData.name,
        amount: formData.amount,
        date: formData.date,
        ...(type === 'expense' && formData.category && { category: formData.category }),
        ...(type === 'income' && formData.serviceId && { serviceId: formData.serviceId }),
      };

      if (finance) {
        await api.put(`/finances/${finance._id}`, data);
        toast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Registro financeiro atualizado com sucesso!',
        });
      } else {
        await api.post('/finances', data);
        toast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Registro financeiro criado com sucesso!',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao salvar registro financeiro',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>
            {finance ? `Editar ${type === 'income' ? 'Ganho' : 'Despesa'}` : `Adicionar ${type === 'income' ? 'Ganho' : 'Despesa'}`}
          </DialogTitle>
          <DialogDescription>
            {finance
              ? `Atualize as informações do ${type === 'income' ? 'ganho' : 'despesa'}`
              : `Preencha os dados do novo ${type === 'income' ? 'ganho' : 'despesa'}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome/Descrição *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          {type === 'expense' && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {type === 'income' && services.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="serviceId">Serviço (opcional)</Label>
              <Select
                id="serviceId"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : finance ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


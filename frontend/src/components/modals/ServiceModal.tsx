import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service?: any;
}

export default function ServiceModal({ open, onClose, onSuccess, service }: ServiceModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          name: service.name || '',
          price: service.price || 0,
          notes: service.notes || '',
        });
      } else {
        setFormData({
          name: '',
          price: 0,
          notes: '',
        });
      }
    }
  }, [open, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (service) {
        await api.put(`/services/${service._id}`, formData);
        toast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Serviço atualizado com sucesso!',
        });
      } else {
        await api.post('/services', formData);
        toast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Serviço criado com sucesso!',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao salvar serviço',
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
          <DialogTitle>{service ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            {service ? 'Atualize as informações do serviço' : 'Preencha os dados do novo serviço'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : service ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


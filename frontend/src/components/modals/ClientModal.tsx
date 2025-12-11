import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: any;
}

export default function ClientModal({ open, onClose, onSuccess, client }: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      cep: '',
      state: '',
      city: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
    },
    isVip: false,
    notes: '',
  });
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      if (client) {
        setFormData({
          name: client.name || '',
          phone: client.phone || '',
          email: client.email || '',
          address: client.address || {
            cep: '',
            state: '',
            city: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
          },
          isVip: client.isVip || false,
          notes: client.notes || '',
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: {
            cep: '',
            state: '',
            city: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
          },
          isVip: false,
          notes: '',
        });
      }
      loadStates();
    }
  }, [open, client]);

  const loadStates = async () => {
    try {
      const response = await api.get('/external-apis/states');
      setStates(response.data);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await api.get(`/external-apis/cities/${stateId}`);
      setCities(response.data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await api.get(`/external-apis/cep/${cep}`);
        const data = response.data;
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.street || prev.address.street,
            neighborhood: data.neighborhood || prev.address.neighborhood,
            city: data.city || prev.address.city,
            state: data.state || prev.address.state,
          },
        }));
        if (data.state && states.length > 0) {
          const state = states.find((s) => s.sigla === data.state);
          if (state) {
            await fetchCities(state.id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (client) {
        await api.put(`/clients/${client._id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {client ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                type="text"
                value={formData.address.cep}
                onChange={(e) => {
                  const cep = e.target.value.replace(/\D/g, '');
                  setFormData({
                    ...formData,
                    address: { ...formData.address, cep },
                  });
                  if (cep.length === 8) {
                    fetchAddressByCep(cep);
                  }
                }}
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <select
                id="state"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={states.find((s) => s.sigla === formData.address.state)?.id || ''}
                onChange={(e) => {
                  const stateId = e.target.value;
                  const state = states.find((s) => s.id === stateId);
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: state?.sigla || '', city: '' },
                  });
                  if (stateId) {
                    fetchCities(stateId);
                  }
                }}
              >
                <option value="">Selecione o estado</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <select
                id="city"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              >
                <option value="">Selecione a cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={formData.address.number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, number: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.address.neighborhood}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, neighborhood: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={formData.address.complement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, complement: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2 flex items-center">
              <input
                type="checkbox"
                id="isVip"
                checked={formData.isVip}
                onChange={(e) => setFormData({ ...formData, isVip: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isVip" className="ml-2 cursor-pointer">
                Cliente VIP
              </Label>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : client ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: any;
}

export default function AppointmentModal({ open, onClose, onSuccess, appointment }: AppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadClients();
      loadServices();
      if (appointment) {
        setFormData({
          clientId: appointment.clientId?._id || appointment.clientId || '',
          date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          startTime: appointment.startTime || '09:00',
          endTime: appointment.endTime || '10:00',
          notes: appointment.notes || '',
        });
        const serviceIds = appointment.serviceIds?.map((s: any) => s._id || s) || [];
        setSelectedServices(serviceIds);
      } else {
        setFormData({
          clientId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          notes: '',
        });
        setSelectedServices([]);
      }
    }
  }, [open, appointment]);

  useEffect(() => {
    calculateTotal();
  }, [selectedServices, services]);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const calculateTotal = () => {
    const total = selectedServices.reduce((sum, serviceId) => {
      const service = services.find((s) => s._id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    setTotalAmount(total);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        serviceIds: selectedServices,
      };

      if (appointment) {
        await api.put(`/appointments/${appointment._id}`, data);
      } else {
        await api.post('/appointments', data);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {appointment ? 'Atualize as informações do agendamento' : 'Preencha os dados do novo agendamento'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente *</Label>
            <Select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário Fim *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Serviços *</Label>
            <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <label key={service._id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => toggleService(service._id)}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">{service.name}</span>
                      <span className="text-sm font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {totalAmount > 0 && (
              <div className="mt-2 p-2 bg-success/10 rounded-md">
                <span className="font-medium">Total: </span>
                <span className="text-lg font-bold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                </span>
              </div>
            )}
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
            <Button type="submit" disabled={loading || selectedServices.length === 0}>
              {loading ? 'Salvando...' : appointment ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


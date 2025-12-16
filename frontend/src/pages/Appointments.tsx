import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Plus, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentModal from '../components/modals/AppointmentModal';

export default function Appointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [view, setView] = useState('day');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [view]);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments', {
        params: { view, date: new Date().toISOString() },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-gray-600">Gerencie seus agendamentos</p>
        </div>
        <Button onClick={() => {
          setSelectedAppointment(null);
          setModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="day">Dia</option>
          <option value="week">Semana</option>
          <option value="month">Mês</option>
        </Select>
      </div>

      <div className="space-y-4">
        {appointments.map((apt) => (
          <Card key={apt._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {(apt.clientId as any)?.name || 'Cliente'}
                </div>
                <div className="text-lg font-bold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.totalAmount)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Data:</span>{' '}
                  {format(new Date(apt.date), "dd/MM/yyyy 'às' HH:mm")}
                </div>
                <div>
                  <span className="font-medium">Serviços:</span>{' '}
                  {(apt.serviceIds as any[])?.map((s: any) => s.name).join(', ') || 'N/A'}
                </div>
                {apt.notes && (
                  <div>
                    <span className="font-medium">Observações:</span> {apt.notes}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setModalOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setAppointmentToDelete(apt);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum agendamento encontrado
        </div>
      )}

      <AppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSuccess={loadAppointments}
        appointment={selectedAppointment}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Cancelar Agendamento</h2>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja cancelar este agendamento?
            </p>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Motivo do cancelamento *</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                required
              />
              <p className="text-xs text-gray-500">
                É importante preencher isso para ajudar a alimentar o programa com os hábitos de suas clientes.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setDeleteModalOpen(false);
                setCancellationReason('');
                setAppointmentToDelete(null);
              }}>
                Não, manter
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!cancellationReason.trim()) {
                    toast({
                      variant: 'warning',
                      title: 'Aviso',
                      description: 'Por favor, informe o motivo do cancelamento',
                    });
                    return;
                  }
                  try {
                    await api.delete(`/appointments/${appointmentToDelete._id}?reason=${encodeURIComponent(cancellationReason)}`);
                    toast({
                      variant: 'success',
                      title: 'Sucesso!',
                      description: 'Agendamento cancelado com sucesso!',
                    });
                    setDeleteModalOpen(false);
                    setCancellationReason('');
                    setAppointmentToDelete(null);
                    loadAppointments();
                  } catch (error: any) {
                    toast({
                      variant: 'error',
                      title: 'Erro',
                      description: error.response?.data?.message || 'Erro ao cancelar agendamento',
                    });
                  }
                }}
              >
                Sim, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


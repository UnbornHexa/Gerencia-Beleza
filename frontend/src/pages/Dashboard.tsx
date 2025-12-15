import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import WhatsAppModal from '../components/modals/WhatsAppModal';
import FinanceModal from '../components/modals/FinanceModal';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [cashData, setCashData] = useState({
    previousMonth: 0,
    currentMonth: 0,
    nextMonth: 0,
  });
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [whatsappAction, setWhatsappAction] = useState<'confirm' | 'reschedule' | 'cancel'>('confirm');
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const previousMonth = subMonths(now, 1);
      const nextMonth = addMonths(now, 1);

      // Load cash data for each month
      const [prevData, currData, nextData] = await Promise.all([
        api.get('/finances/summary', {
          params: { period: 'month', startDate: format(previousMonth, 'yyyy-MM-01'), endDate: format(previousMonth, 'yyyy-MM-dd') },
        }),
        api.get('/finances/summary', { params: { period: 'month' } }),
        api.get('/finances/summary', {
          params: { period: 'month', startDate: format(nextMonth, 'yyyy-MM-01'), endDate: format(nextMonth, 'yyyy-MM-dd') },
        }),
      ]);

      setCashData({
        previousMonth: prevData.data.balance,
        currentMonth: currData.data.balance,
        nextMonth: nextData.data.balance,
      });

      // Load today's projected earnings
      const earningsResponse = await api.get('/appointments/today-earnings');
      setTodayEarnings(earningsResponse.data);

      // Load upcoming appointments
      const appointmentsResponse = await api.get('/appointments/upcoming?hours=3');
      setUpcomingAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const handleAppointmentAction = async (appointment: any, action: 'confirm' | 'reschedule' | 'cancel') => {
    if (!confirm(`Tem certeza que deseja ${action === 'confirm' ? 'confirmar' : action === 'reschedule' ? 'remarcar' : 'cancelar'} este agendamento?`)) {
      return;
    }

    try {
      // Get user's WhatsApp messages templates
      const userResponse = await api.get('/users/me');
      const templates = userResponse.data.whatsappMessages || {};

      let message = '';
      const clientName = (appointment.clientId as any)?.name || 'Cliente';
      const date = format(new Date(appointment.date), 'dd/MM/yyyy');
      const time = appointment.startTime;

      switch (action) {
        case 'confirm':
          message = templates.confirm || 'Olá! Confirmo seu agendamento para {date} às {time}.';
          break;
        case 'reschedule':
          message = templates.reschedule || 'Olá! Preciso remarcar seu agendamento. Podemos reagendar?';
          break;
        case 'cancel':
          message = templates.cancel || 'Olá! Infelizmente preciso cancelar seu agendamento. Podemos reagendar?';
          break;
      }

      // Replace variables
      message = message.replace('{date}', date).replace('{time}', time).replace('{client}', clientName);

      const clientPhone = (appointment.clientId as any)?.phone;
      if (clientPhone) {
        setSelectedAppointment(appointment);
        setWhatsappAction(action);
        setWhatsappModalOpen(true);
      } else {
        alert('Cliente não possui telefone cadastrado');
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setIncomeModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Ganho
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setExpenseModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Despesa
          </Button>
        </div>
      </div>

      {/* Cash Cards and Daily Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Mês Anterior</div>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashData.previousMonth)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Mês Atual</div>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashData.currentMonth)}
                </div>
                <div className={`text-xs mt-1 ${calculatePercentage(cashData.currentMonth, cashData.previousMonth) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {calculatePercentage(cashData.currentMonth, cashData.previousMonth) >= 0 ? (
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="inline w-3 h-3 mr-1" />
                  )}
                  {Math.abs(calculatePercentage(cashData.currentMonth, cashData.previousMonth)).toFixed(1)}% vs mês anterior
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Próximo Mês</div>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashData.nextMonth)}
                </div>
                <div className={`text-xs mt-1 ${calculatePercentage(cashData.nextMonth, cashData.currentMonth) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {calculatePercentage(cashData.nextMonth, cashData.currentMonth) >= 0 ? (
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="inline w-3 h-3 mr-1" />
                  )}
                  {Math.abs(calculatePercentage(cashData.nextMonth, cashData.currentMonth)).toFixed(1)}% vs mês atual
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projeção do Dia</CardTitle>
            <CardDescription>Ganhos projetados para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(todayEarnings)}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Baseado nos agendamentos confirmados de hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Clientes agendadas para as próximas 3 horas</CardDescription>
          </div>
          <Link to="/appointments">
            <Button variant="outline" size="sm">
              Ir para agenda
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento nas próximas 3 horas</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => {
                const client = apt.clientId as any;
                const clientPhone = client?.phone;
                const hasPhone = !!clientPhone;
                
                return (
                  <div
                    key={apt._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {client?.name || 'Cliente'}
                        {client?.isVip && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(apt.date), "dd/MM/yyyy 'às' HH:mm")}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.totalAmount)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {hasPhone && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAppointmentAction(apt, 'confirm')}
                            title="Confirmar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAppointmentAction(apt, 'reschedule')}
                            title="Remarcar"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAppointmentAction(apt, 'cancel')}
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <WhatsAppModal
        open={whatsappModalOpen}
        onClose={() => {
          setWhatsappModalOpen(false);
          setSelectedAppointment(null);
        }}
        phone={(selectedAppointment?.clientId as any)?.phone || ''}
        message={(() => {
          if (!selectedAppointment || !user) return '';
          const templates = user.whatsappMessages || {};
          const clientName = (selectedAppointment.clientId as any)?.name || 'Cliente';
          const date = format(new Date(selectedAppointment.date), 'dd/MM/yyyy');
          const time = selectedAppointment.startTime;
          
          let message = '';
          switch (whatsappAction) {
            case 'confirm':
              message = templates.confirm || 'Olá! Confirmo seu agendamento para {date} às {time}.';
              break;
            case 'reschedule':
              message = templates.reschedule || 'Olá! Preciso remarcar seu agendamento. Podemos reagendar?';
              break;
            case 'cancel':
              message = templates.cancel || 'Olá! Infelizmente preciso cancelar seu agendamento. Podemos reagendar?';
              break;
          }
          
          return message.replace('{date}', date).replace('{time}', time).replace('{client}', clientName);
        })()}
        appointment={selectedAppointment}
      />
      <FinanceModal
        open={incomeModalOpen}
        onClose={() => {
          setIncomeModalOpen(false);
        }}
        onSuccess={() => {
          loadDashboardData();
          setIncomeModalOpen(false);
        }}
        type="income"
      />
      <FinanceModal
        open={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
        }}
        onSuccess={() => {
          loadDashboardData();
          setExpenseModalOpen(false);
        }}
        type="expense"
      />
    </div>
  );
}

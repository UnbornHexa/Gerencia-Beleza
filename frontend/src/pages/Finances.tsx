import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Plus, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import FinanceModal from '../components/modals/FinanceModal';
import { exportFinanceReport } from '../utils/pdfExport';

export default function Finances() {
  const [finances, setFinances] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedFinance, setSelectedFinance] = useState<any>(null);

  useEffect(() => {
    loadFinances();
  }, [period]);

  const loadFinances = async () => {
    try {
      const [financesResponse, summaryResponse] = await Promise.all([
        api.get('/finances', { params: { period } }),
        api.get('/finances/summary', { params: { period } }),
      ]);
      setFinances(financesResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Erro ao carregar finanças:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = summary
    ? [
        { name: 'Ganhos', value: summary.totalIncome },
        { name: 'Despesas', value: summary.totalExpense },
      ]
    : [];

  const COLORS = ['#00C48C', '#FF647C'];

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finanças</h1>
          <p className="text-gray-600">Controle seus ganhos e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (summary && finances) {
                exportFinanceReport({
                  finances,
                  summary,
                  period,
                  startDate: period === 'custom' ? new Date().toISOString().split('T')[0] : undefined,
                  endDate: period === 'custom' ? new Date().toISOString().split('T')[0] : undefined,
                });
              } else {
                alert('Carregue os dados primeiro');
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => {
            setSelectedFinance(null);
            setIncomeModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Ganho
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setSelectedFinance(null);
              setExpenseModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Despesa
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="month">Este mês</option>
          <option value="3months">3 meses</option>
          <option value="6months">6 meses</option>
          <option value="year">Este ano</option>
        </Select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalIncome)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalExpense)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ganhos vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={chartData}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      <FinanceModal
        open={incomeModalOpen}
        onClose={() => {
          setIncomeModalOpen(false);
          setSelectedFinance(null);
        }}
        onSuccess={loadFinances}
        type="income"
        finance={selectedFinance}
      />
      <FinanceModal
        open={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setSelectedFinance(null);
        }}
        onSuccess={loadFinances}
        type="expense"
        finance={selectedFinance}
      />
    </div>
  );
}


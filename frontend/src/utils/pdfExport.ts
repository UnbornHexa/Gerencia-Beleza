import jsPDF from 'jspdf';

interface FinanceData {
  finances: any[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    incomeByService?: Record<string, number>;
    expenseByCategory?: Record<string, number>;
  };
  period: string;
  startDate?: string;
  endDate?: string;
}

export function exportFinanceReport(data: FinanceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Period
  doc.setFontSize(12);
  const periodText = getPeriodText(data.period, data.startDate, data.endDate);
  doc.text(`Período: ${periodText}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary
  doc.setFontSize(14);
  doc.text('Resumo', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.text(`Total de Ganhos: ${formatCurrency(data.summary.totalIncome)}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total de Despesas: ${formatCurrency(data.summary.totalExpense)}`, 20, yPosition);
  yPosition += 7;
  doc.setFontSize(12);
  doc.setTextColor(data.summary.balance >= 0 ? 0, 150, 0 : 255, 0, 0);
  doc.text(`Saldo: ${formatCurrency(data.summary.balance)}`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Income by Service
  if (data.summary.incomeByService && Object.keys(data.summary.incomeByService).length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.text('Ganhos por Serviço', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    Object.entries(data.summary.incomeByService).forEach(([serviceId, amount]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${serviceId}: ${formatCurrency(amount as number)}`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  // Expenses by Category
  if (data.summary.expenseByCategory && Object.keys(data.summary.expenseByCategory).length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.text('Despesas por Categoria', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    Object.entries(data.summary.expenseByCategory).forEach(([category, amount]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${category}: ${formatCurrency(amount as number)}`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Transactions List
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }
  doc.setFontSize(14);
  doc.text('Transações', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  const headers = ['Data', 'Tipo', 'Descrição', 'Valor'];
  const colWidths = [40, 30, 80, 30];
  let xPos = 20;

  // Table Header
  headers.forEach((header, index) => {
    doc.setFont(undefined, 'bold');
    doc.text(header, xPos, yPosition);
    xPos += colWidths[index];
  });
  yPosition += 6;
  doc.setFont(undefined, 'normal');

  // Table Rows
  data.finances.forEach((finance) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      xPos = 20;
      headers.forEach((header, index) => {
        doc.setFont(undefined, 'bold');
        doc.text(header, xPos, yPosition);
        xPos += colWidths[index];
      });
      yPosition += 6;
      doc.setFont(undefined, 'normal');
    }

    xPos = 20;
    const date = new Date(finance.date).toLocaleDateString('pt-BR');
    const type = finance.type === 'income' ? 'Ganho' : 'Despesa';
    const description = finance.name.length > 30 ? finance.name.substring(0, 30) + '...' : finance.name;
    const amount = formatCurrency(finance.amount);

    doc.text(date, xPos, yPosition);
    xPos += colWidths[0];
    doc.text(type, xPos, yPosition);
    xPos += colWidths[1];
    doc.text(description, xPos, yPosition);
    xPos += colWidths[2];
    doc.setTextColor(finance.type === 'income' ? 0, 150, 0 : 255, 0, 0);
    doc.text(amount, xPos, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 6;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' },
    );
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' },
    );
  }

  // Save PDF
  const fileName = `relatorio-financeiro-${data.period}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getPeriodText(period: string, startDate?: string, endDate?: string): string {
  switch (period) {
    case 'month':
      return 'Este mês';
    case '3months':
      return 'Últimos 3 meses';
    case '6months':
      return 'Últimos 6 meses';
    case 'year':
      return 'Este ano';
    case 'custom':
      return `${startDate} a ${endDate}`;
    default:
      return period;
  }
}


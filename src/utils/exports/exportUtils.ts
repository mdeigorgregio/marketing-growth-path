import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Project } from '@/hooks/useProjects';

// Função para baixar arquivo
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Função para formatar dados para exportação
const formatProjectForExport = (project: Project) => {
  return {
    'ID': project.id,
    'Empresa': project.empresa,
    'Responsável': project.responsavel,
    'Email': project.email,
    'Telefone': project.telefone,
    'Status': project.status,
    'Origem': project.origem || 'Não informado',
    'Plano Escolhido': project.plano_escolhido || 'Não informado',
    'Valor do Plano': project.valor_plano ? `R$ ${project.valor_plano.toFixed(2)}` : 'Não informado',
    'CEP': project.cep || 'Não informado',
    'Endereço': project.endereco || 'Não informado',
    'Cidade': project.cidade || 'Não informado',
    'Estado': project.estado || 'Não informado',
    'Data de Cadastro': format(new Date(project.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    'Data do Contrato': project.data_contrato ? format(new Date(project.data_contrato), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado',
    'Data de Vencimento': project.data_vencimento ? format(new Date(project.data_vencimento), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado',
    'Status do Pagamento': project.status_pagamento || 'Não informado',
    'Observações': project.observacoes || 'Nenhuma'
  };
};

// Exportar para Excel
export const exportToExcel = async (projects: Project[], filename: string) => {
  const formattedData = projects.map(formatProjectForExport);
  
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  
  // Configurar largura das colunas
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 25 }, // Empresa
    { wch: 20 }, // Responsável
    { wch: 30 }, // Email
    { wch: 15 }, // Telefone
    { wch: 15 }, // Status
    { wch: 15 }, // Origem
    { wch: 20 }, // Plano
    { wch: 15 }, // Valor
    { wch: 10 }, // CEP
    { wch: 30 }, // Endereço
    { wch: 20 }, // Cidade
    { wch: 10 }, // Estado
    { wch: 18 }, // Data Cadastro
    { wch: 15 }, // Data Contrato
    { wch: 15 }, // Data Vencimento
    { wch: 15 }, // Status Pagamento
    { wch: 30 }  // Observações
  ];
  
  worksheet['!cols'] = columnWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  
  // Gerar buffer e baixar
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, filename);
};

// Exportar para CSV
export const exportToCSV = async (projects: Project[], filename: string) => {
  const formattedData = projects.map(formatProjectForExport);
  
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

// Exportar para JSON
export const exportToJSON = async (projects: Project[], filename: string) => {
  const jsonContent = JSON.stringify(projects, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadFile(blob, filename);
};

// Exportar para PDF
export const exportToPDF = async (projects: Project[], filename: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Configurar fonte
  pdf.setFont('helvetica');
  
  // Título
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Relatório de Clientes', margin, yPosition);
  yPosition += 15;
  
  // Data de geração
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPosition);
  yPosition += 10;
  
  // Estatísticas resumidas
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Resumo:', margin, yPosition);
  yPosition += lineHeight;
  
  const stats = {
    total: projects.length,
    leads: projects.filter(p => p.status === 'LEAD').length,
    assinantes: projects.filter(p => p.status === 'Assinante').length,
    inadimplentes: projects.filter(p => p.status === 'Inadimplente').length,
    cancelados: projects.filter(p => p.status === 'Cancelado').length
  };
  
  pdf.setFontSize(10);
  pdf.text(`• Total de Clientes: ${stats.total}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`• Leads: ${stats.leads}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`• Assinantes: ${stats.assinantes}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`• Inadimplentes: ${stats.inadimplentes}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`• Cancelados: ${stats.cancelados}`, margin + 5, yPosition);
  yPosition += 15;
  
  // Lista de clientes
  pdf.setFontSize(12);
  pdf.text('Lista de Clientes:', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(8);
  
  projects.forEach((project, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Dados do cliente
    const clientData = [
      `${index + 1}. ${project.empresa}`,
      `   Responsável: ${project.responsavel}`,
      `   Email: ${project.email}`,
      `   Status: ${project.status}`,
      `   Origem: ${project.origem || 'Não informado'}`,
      `   Plano: ${project.plano_escolhido || 'Não informado'}`,
      `   Valor: ${project.valor_plano ? `R$ ${project.valor_plano.toFixed(2)}` : 'Não informado'}`,
      `   Cadastro: ${format(new Date(project.created_at), 'dd/MM/yyyy', { locale: ptBR })}`
    ];
    
    clientData.forEach(line => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 4;
    });
    
    yPosition += 3; // Espaço entre clientes
  });
  
  // Salvar PDF
  pdf.save(filename);
};

// Função para gerar relatório com gráficos (usando html2canvas)
export const exportAdvancedPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento não encontrado para captura');
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 295; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
};
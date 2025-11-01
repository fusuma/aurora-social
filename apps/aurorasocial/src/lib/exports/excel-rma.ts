/**
 * RMA Excel Export Utility
 *
 * Story 3.3: Excel Export Functionality
 *
 * Uses xlsx library to generate spreadsheet reports with raw RMA data
 * for further analysis and manipulation
 *
 * Features:
 * - Multi-sheet workbook (Summary + Details)
 * - Raw data in tabular format
 * - Professional formatting
 * - Tenant-isolated data (NFR2, NFR5)
 * - Descriptive filename generation (AC5)
 */

import * as XLSX from "xlsx";

// RMA Report Data Interface (matches reporting router)
interface RMAReportData {
  mes: number;
  ano: number;
  totalAtendimentos: number;
  atendimentosPorTipoDemanda: Array<{
    tipoDemanda: string;
    count: number;
  }>;
  atendimentosPorDia: Array<{
    dia: number;
    count: number;
  }>;
  totalFamiliasAtendidas: number;
  totalIndividuosAtendidos: number;
  tenantName?: string;
}

// Month names in Portuguese
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/**
 * Generate RMA Excel Workbook
 *
 * Creates a multi-sheet Excel file with:
 * - Sheet 1: Summary (overview metrics)
 * - Sheet 2: Atendimentos por Tipo de Demanda
 * - Sheet 3: Atendimentos por Dia
 */
export function generateRMAExcelWorkbook(data: RMAReportData): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const monthName = monthNames[data.mes - 1];
  const generatedDate = new Date().toLocaleDateString("pt-BR");

  // Sheet 1: Summary
  const summaryData: (string | number)[][] = [
    ["Relatório Mensal de Atendimentos (RMA)"],
    [],
    ["Período:", `${monthName} de ${data.ano}`],
    ...(data.tenantName ? [["Município:", data.tenantName] as (string | number)[]] : []),
    ["Gerado em:", generatedDate],
    ["Sistema:", "AuroraSocial"],
    [],
    ["RESUMO GERAL"],
    [],
    ["Métrica", "Valor"],
    ["Total de Atendimentos", data.totalAtendimentos],
    ["Famílias Atendidas", data.totalFamiliasAtendidas],
    ["Indivíduos Atendidos", data.totalIndividuosAtendidos],
    [
      "Média Diária de Atendimentos",
      data.atendimentosPorDia.length > 0
        ? Math.round(data.totalAtendimentos / data.atendimentosPorDia.length)
        : 0,
    ],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];

  // Apply bold formatting to headers (basic styling)
  // Note: XLSX basic formatting - full styling requires xlsx-style or similar
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

  // Sheet 2: Atendimentos por Tipo de Demanda
  const tipoDemandaData: (string | number)[][] = [
    ["ATENDIMENTOS POR TIPO DE DEMANDA"],
    [],
    ["Tipo de Demanda", "Quantidade", "Percentual"],
  ];

  if (data.atendimentosPorTipoDemanda.length > 0) {
    data.atendimentosPorTipoDemanda.forEach((item) => {
      const percentage =
        data.totalAtendimentos > 0
          ? ((item.count / data.totalAtendimentos) * 100).toFixed(1)
          : "0.0";
      tipoDemandaData.push([item.tipoDemanda, item.count, `${percentage}%`]);
    });

    // Add total row
    tipoDemandaData.push([]);
    tipoDemandaData.push(["TOTAL", data.totalAtendimentos, "100.0%"]);
  } else {
    tipoDemandaData.push(["Nenhum atendimento registrado no período", "", ""]);
  }

  const tipoDemandaSheet = XLSX.utils.aoa_to_sheet(tipoDemandaData);

  // Set column widths
  tipoDemandaSheet["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, tipoDemandaSheet, "Por Tipo de Demanda");

  // Sheet 3: Atendimentos por Dia
  const porDiaData: (string | number)[][] = [
    ["ATENDIMENTOS POR DIA DO MÊS"],
    [],
    ["Dia", "Atendimentos"],
  ];

  if (data.atendimentosPorDia.length > 0) {
    data.atendimentosPorDia.forEach((item) => {
      porDiaData.push([`Dia ${item.dia}`, item.count]);
    });

    // Add total row
    porDiaData.push([]);
    porDiaData.push(["TOTAL", data.atendimentosPorDia.reduce((sum, item) => sum + item.count, 0)]);
  } else {
    porDiaData.push(["Nenhum atendimento registrado no período", ""]);
  }

  const porDiaSheet = XLSX.utils.aoa_to_sheet(porDiaData);

  // Set column widths
  porDiaSheet["!cols"] = [{ wch: 15 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, porDiaSheet, "Por Dia");

  return workbook;
}

/**
 * Generate RMA Excel Buffer (for server-side generation)
 *
 * Returns a Buffer that can be sent as a download response
 */
export function generateRMAExcelBuffer(data: RMAReportData): Buffer {
  const workbook = generateRMAExcelWorkbook(data);
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

/**
 * Generate descriptive filename for RMA Excel
 * AC5: Descriptive filename (e.g., "RMA_Outubro_2025.xlsx")
 */
export function generateRMAExcelFilename(mes: number, ano: number): string {
  const monthName = monthNames[mes - 1];
  return `RMA_${monthName}_${ano}.xlsx`;
}

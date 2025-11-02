/**
 * RMA PDF Export Utility
 *
 * Story 3.3: PDF Export Functionality
 *
 * Uses @react-pdf/renderer to generate formatted PDF reports
 * following the official RMA (Relatório Mensal de Atendimentos) layout
 *
 * Features:
 * - React-based PDF generation (declarative)
 * - Official SUAS RMA format
 * - Professional layout with proper spacing
 * - Tenant-isolated data (NFR2, NFR5)
 * - Descriptive filename generation (AC5)
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  tenantName?: string; // Optional tenant name for header
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginTop: 15,
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 5,
  },
  summaryGrid: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    border: 1,
    borderColor: "#cbd5e1",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderBottom: 2,
    borderBottomColor: "#cbd5e1",
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#f8fafc",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableCell: {
    fontSize: 9,
    color: "#1e293b",
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    borderTop: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: "#64748b",
  },
});

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
 * RMA PDF Document Component
 */
export const RMAPDFDocument: React.FC<{ data: RMAReportData }> = ({ data }) => {
  const monthName = monthNames[data.mes - 1];
  const generatedDate = new Date().toLocaleDateString("pt-BR");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Mensal de Atendimentos (RMA)</Text>
          <Text style={styles.subtitle}>
            Período: {monthName} de {data.ano}
          </Text>
          {data.tenantName && <Text style={styles.subtitle}>{data.tenantName}</Text>}
          <Text style={styles.subtitle}>Gerado em: {generatedDate} | Sistema: AuroraSocial</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total de Atendimentos</Text>
            <Text style={styles.summaryValue}>{data.totalAtendimentos}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Famílias Atendidas</Text>
            <Text style={styles.summaryValue}>{data.totalFamiliasAtendidas}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Indivíduos Atendidos</Text>
            <Text style={styles.summaryValue}>{data.totalIndividuosAtendidos}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Média Diária</Text>
            <Text style={styles.summaryValue}>
              {data.atendimentosPorDia.length > 0
                ? Math.round(data.totalAtendimentos / data.atendimentosPorDia.length)
                : 0}
            </Text>
          </View>
        </View>

        {/* Atendimentos por Tipo de Demanda */}
        <Text style={styles.sectionTitle}>Atendimentos por Tipo de Demanda</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Tipo de Demanda</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
              Quantidade
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
              Percentual
            </Text>
          </View>

          {/* Table Rows */}
          {data.atendimentosPorTipoDemanda.length > 0 ? (
            data.atendimentosPorTipoDemanda.map((item, index) => {
              const percentage =
                data.totalAtendimentos > 0
                  ? ((item.count / data.totalAtendimentos) * 100).toFixed(1)
                  : "0.0";

              return (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{item.tipoDemanda}</Text>
                  <Text style={[styles.tableCellBold, { flex: 1, textAlign: "right" }]}>
                    {item.count}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                    {percentage}%
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { textAlign: "center", width: "100%" }]}>
                Nenhum atendimento registrado no período
              </Text>
            </View>
          )}

          {/* Table Footer */}
          {data.atendimentosPorTipoDemanda.length > 0 && (
            <View style={[styles.tableRow, { backgroundColor: "#f1f5f9" }]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>Total</Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: "right" }]}>
                {data.totalAtendimentos}
              </Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: "right" }]}>100.0%</Text>
            </View>
          )}
        </View>

        {/* Atendimentos por Dia do Mês */}
        <Text style={styles.sectionTitle}>Atendimentos por Dia do Mês</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Dia</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
              Atendimentos
            </Text>
          </View>

          {/* Table Rows */}
          {data.atendimentosPorDia.length > 0 ? (
            data.atendimentosPorDia.map((item, index) => (
              <View key={item.dia} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 1 }]}>Dia {item.dia}</Text>
                <Text style={[styles.tableCellBold, { flex: 1, textAlign: "right" }]}>
                  {item.count}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { textAlign: "center", width: "100%" }]}>
                Nenhum atendimento registrado no período
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Relatório Oficial conforme Sistema Único de Assistência Social (SUAS) | Gerado pelo
            AuroraSocial
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate descriptive filename for RMA PDF
 * AC5: Descriptive filename (e.g., "RMA_Outubro_2025.pdf")
 */
export function generateRMAPDFFilename(mes: number, ano: number): string {
  const monthName = monthNames[mes - 1];
  return `RMA_${monthName}_${ano}.pdf`;
}

import jsPDF from "jspdf";

export function exportPdf(filename: string, title: string, rows: Record<string, unknown>[]) {
  const pdf = new jsPDF();
  pdf.setFontSize(18);
  pdf.text(title, 14, 20);
  pdf.setFontSize(10);
  rows.slice(0, 24).forEach((row, index) => {
    pdf.text(JSON.stringify(row), 14, 32 + index * 8, { maxWidth: 180 });
  });
  pdf.save(filename);
}

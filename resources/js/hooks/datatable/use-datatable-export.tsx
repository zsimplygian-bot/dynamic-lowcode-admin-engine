import { useCallback } from "react";
import * as XLSX from "xlsx";

interface Column {
  accessor: string;
  header: string;
}

export function useDataExport(view: string, columns: Column[], data: Record<string, any>[]) {
  const exportToExcel = useCallback(() => {
    // 1. Filtrar columna de acciones y estructurar encabezados
    const validColumns = columns.filter((col) => col.accessor !== "acciones");

    if (!data.length || !validColumns.length) return;

    const cleanData = data.map((row) => {
      const cleanRow: Record<string, any> = {};
      validColumns.forEach((col) => {
        cleanRow[col.header] = row[col.accessor] ?? "";
      });
      return cleanRow;
    });

    // 2. Crear hoja de cálculo y libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, view.toUpperCase());

    // 3. Descargar el archivo
    XLSX.writeFile(workbook, `${view}_export_${Date.now()}.xlsx`);
  }, [view, columns, data]);

  return { exportToExcel };
}
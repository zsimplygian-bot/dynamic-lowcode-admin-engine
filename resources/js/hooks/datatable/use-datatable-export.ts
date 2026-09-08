import { useCallback } from "react";
import * as XLSX from "xlsx";
interface Column { accessor: string; header: string }
export function useDataExport(tableName: string, columns: Column[], data: Record<string, any>[]) {
  const exportToExcel = useCallback(() => {
    if (!data.length || !columns.length) return;
    const headers = columns.map((col) => col.header);
    const rows = data.map((row) => columns.map((col) => row[col.accessor]));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName.toUpperCase());
    XLSX.writeFile(workbook, `${tableName}_${Date.now()}.xlsx`);
  }, [tableName, columns, data]);
  return { exportToExcel };
}
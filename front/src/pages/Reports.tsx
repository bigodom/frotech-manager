import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/services/useApi";

function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const separator = ";";
  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(separator),
    ...rows.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(separator))
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const dateKeys = ["invoiceDate", "date", "createdAt", "updatedAt"]; 

  const formatDateBR = (value: unknown): string => {
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value ?? "");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const isIsoDateString = (value: unknown): boolean => {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value);
  };

  const isNumericString = (value: unknown): boolean => {
    return typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value);
  };

  const formatNumberBR = (value: unknown): string => {
    if (typeof value === "number") return String(value).replace(".", ",");
    if (isNumericString(value)) return String(value).replace(".", ",");
    return String(value ?? "");
  };

  const handleDownload = async (type: "maintenance" | "fuel") => {
    setLoading(true);
    try {
      const endpoint = type === "maintenance" ? "/maintenance" : "/fuel";
      const res = await api.get(endpoint);
      const rows: Record<string, any>[] = Array.isArray(res.data) ? res.data : [];

      const formattedRows = rows.map((row) => {
        const out: Record<string, any> = {};
        const keys = Object.keys(row);
        for (const key of keys) {
          const value = row[key];
          if (value == null) {
            out[key] = "";
            continue;
          }
          if (dateKeys.includes(key) || isIsoDateString(value)) {
            out[key] = formatDateBR(value);
            continue;
          }
          if (typeof value === "number" || isNumericString(value)) {
            out[key] = formatNumberBR(value);
            continue;
          }
          if (typeof value === "object") {
            out[key] = JSON.stringify(value);
            continue;
          }
          out[key] = String(value);
        }
        return out;
      });

      downloadCSV(`${type}_report.csv`, formattedRows);
    } catch (err) {
      alert("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
      <div className="space-y-4">
        <Button className="w-full btn btn-primary" onClick={() => handleDownload("maintenance")} disabled={loading}>
          Baixar CSV de Manutenção
        </Button>
        <Button className="w-full btn btn-primary" onClick={() => handleDownload("fuel")} disabled={loading}>
          Baixar CSV de Combustível
        </Button>
      </div>
    </div>
  );
}

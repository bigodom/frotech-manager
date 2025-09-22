import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/services/useApi";

function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const separator = ",";
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

  const handleDownload = async (type: "maintenance" | "fuel") => {
    setLoading(true);
    try {
      const endpoint = type === "maintenance" ? "/maintenance" : "/fuel";
      const res = await api.get(endpoint);
      downloadCSV(`${type}_report.csv`, res.data);
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
        <Button onClick={() => handleDownload("maintenance")} disabled={loading}>
          Baixar CSV de Manutenção
        </Button>
        <Button onClick={() => handleDownload("fuel")} disabled={loading}>
          Baixar CSV de Combustível
        </Button>
      </div>
    </div>
  );
}

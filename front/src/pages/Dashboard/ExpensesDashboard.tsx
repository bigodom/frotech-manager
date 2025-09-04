import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import api from "@/services/useApi";

// Dados do gráfico: { date: string, value: number }

export default function ExpensesDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [rawMaintenanceData, setRawMaintenanceData] = useState<{ date: string, value: number }[]>([]);
  const [rawFuelData, setRawFuelData] = useState<{ date: string, value: number }[]>([]);
  const [maintenanceChartData, setMaintenanceChartData] = useState<{ date: string, value: number }[]>([]);
  const [fuelChartData, setFuelChartData] = useState<{ date: string, value: number }[]>([]);

  const fetchDashboardData = async () => {
    const [maintenanceRes, fuelRes] = await Promise.all([
      api.get("/dashboard/maintenance"),
      api.get("/dashboard/fuel"),
    ]);
    const toChartArray = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort(([a], [b]) => {
          const [am, ay] = a.split("/");
          const [bm, by] = b.split("/");
          return Number(ay) - Number(by) || Number(am) - Number(bm);
        })
        .map(([date, value]) => ({ date, value }));
    setRawMaintenanceData(toChartArray(maintenanceRes.data));
    setRawFuelData(toChartArray(fuelRes.data));
    setMaintenanceChartData(toChartArray(maintenanceRes.data));
    setFuelChartData(toChartArray(fuelRes.data));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Removido agrupamento/filtro local, agora os dados já vêm prontos do backend

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard de Gastos</h1>
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Data Inicial</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data Final</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <Button
          className="h-10"
          onClick={() => {
            if (startDate && endDate) {
              // Filtra localmente os dados por mês
              const filterByDate = (arr: { date: string, value: number }[]) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                return arr.filter(item => {
                  // item.date formato MM/YYYY
                  const [month, year] = item.date.split("/");
                  const d = new Date(Number(year), Number(month) - 1);
                  return d >= start && d <= end;
                });
              };
              setMaintenanceChartData(filterByDate(rawMaintenanceData));
              setFuelChartData(filterByDate(rawFuelData));
            }
          }}
          disabled={!startDate || !endDate}
        >
          Aplicar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Custo Total por Mês de Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={v => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="value" name="Total Manutenção" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo Total por Mês de Combustível</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={v => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="value" name="Total Combustível" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
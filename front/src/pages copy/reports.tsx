import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, TrendingUp, Calendar, DollarSign, Activity } from "lucide-react";
import type { Vehicle, MileageRecord, VehicleTireAssignment } from "@shared/schema";
import type { DashboardStats } from "@/lib/types";

interface ReportFilters {
  period: string;
  reportType: string;
  vehicleId: string;
}

interface ReportSummary {
  totalKm: number;
  tiresChanged: number;
  totalCost: number;
  avgKmPerDay: number;
}

export default function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "last_month",
    reportType: "mileage",
    vehicleId: "all",
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: mileageRecords } = useQuery<MileageRecord[]>({
    queryKey: ["/api/mileage-records"],
  });

  const { data: tireAssignments } = useQuery<VehicleTireAssignment[]>({
    queryKey: ["/api/vehicle-tire-assignments"],
  });

  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Calculate report summary based on filters
  const calculateReportSummary = (): ReportSummary => {
    if (!mileageRecords || !vehicles || !tireAssignments) {
      return { totalKm: 0, tiresChanged: 0, totalCost: 0, avgKmPerDay: 0 };
    }

    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "last_3_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "last_year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    // Filter records by date and vehicle
    const filteredRecords = mileageRecords.filter(record => {
      const recordDate = new Date(record.recordDate);
      const matchesDate = recordDate >= startDate;
      const matchesVehicle = filters.vehicleId === "all" || record.vehicleId.toString() === filters.vehicleId;
      return matchesDate && matchesVehicle;
    });

    // Calculate total kilometers
    let totalKm = 0;
    if (filteredRecords.length > 0) {
      const vehicleKm = new Map<number, { min: number; max: number }>();
      
      filteredRecords.forEach(record => {
        const current = vehicleKm.get(record.vehicleId) || { min: Infinity, max: 0 };
        vehicleKm.set(record.vehicleId, {
          min: Math.min(current.min, record.mileage),
          max: Math.max(current.max, record.mileage),
        });
      });

      vehicleKm.forEach(({ min, max }) => {
        totalKm += max - min;
      });
    }

    // Calculate tires changed in period
    const tiresChanged = tireAssignments.filter(assignment => {
      const assignedDate = new Date(assignment.assignedAt);
      const matchesDate = assignedDate >= startDate;
      const matchesVehicle = filters.vehicleId === "all" || assignment.vehicleId.toString() === filters.vehicleId;
      return matchesDate && matchesVehicle;
    }).length;

    // Mock cost calculation (in a real app this would come from actual cost data)
    const totalCost = tiresChanged * 350; // Average tire cost

    // Calculate average km per day
    const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgKmPerDay = daysDiff > 0 ? totalKm / daysDiff : 0;

    return {
      totalKm,
      tiresChanged,
      totalCost,
      avgKmPerDay,
    };
  };

  const reportSummary = calculateReportSummary();

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // In a real implementation, this would generate and download a report file
    console.log("Exporting report with filters:", filters);
    alert("Funcionalidade de exportação em desenvolvimento");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Report Filters */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Relatórios e Análises</CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50 border-b border-gray-200">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <Select value={filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_month">Último mês</SelectItem>
                  <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                  <SelectItem value="last_year">Último ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
              <Select value={filters.reportType} onValueChange={(value) => handleFilterChange("reportType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mileage">Quilometragem</SelectItem>
                  <SelectItem value="tires">Consumo de Pneus</SelectItem>
                  <SelectItem value="costs">Custos</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
              <Select value={filters.vehicleId} onValueChange={(value) => handleFilterChange("vehicleId", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os veículos</SelectItem>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button type="button" className="flex-1 bg-primary hover:bg-primary/90">
                Gerar
              </Button>
              <Button type="button" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Report Content */}
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary Cards */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Resumo do Período</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary-600" />
                    <p className="text-sm text-gray-600">KM Total Rodados</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportSummary.totalKm.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-success-600" />
                    <p className="text-sm text-gray-600">Pneus Trocados</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportSummary.tiresChanged}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-warning-600" />
                    <p className="text-sm text-gray-600">Custo Total</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {reportSummary.totalCost.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">Média KM/Dia</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(reportSummary.avgKmPerDay).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Evolução Mensal</h4>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de Relatório</p>
                  <p className="text-xs text-gray-400">
                    {filters.reportType === "mileage" && "Evolução da quilometragem"}
                    {filters.reportType === "tires" && "Consumo de pneus"}
                    {filters.reportType === "costs" && "Evolução de custos"}
                    {filters.reportType === "maintenance" && "Histórico de manutenção"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report Table */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Relatório Detalhado - {filters.reportType === "mileage" ? "Quilometragem" : 
                                   filters.reportType === "tires" ? "Pneus" :
                                   filters.reportType === "costs" ? "Custos" : "Manutenção"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filters.reportType === "mileage" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM Inicial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM Atual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles?.filter(vehicle => 
                    filters.vehicleId === "all" || vehicle.id.toString() === filters.vehicleId
                  ).map((vehicle) => {
                    const kmDifference = vehicle.currentMileage - vehicle.initialMileage;
                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                          <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.initialMileage.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.currentMileage.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {kmDifference.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              vehicle.status === "active" ? "bg-success-100 text-success-800" :
                              vehicle.status === "maintenance" ? "bg-warning-100 text-warning-800" :
                              "bg-gray-100 text-gray-800"
                            }
                            variant="secondary"
                          >
                            {vehicle.status === "active" ? "Ativo" :
                             vehicle.status === "maintenance" ? "Manutenção" : "Inativo"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filters.reportType === "tires" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pneus Atribuídos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Última Troca</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles?.filter(vehicle => 
                    filters.vehicleId === "all" || vehicle.id.toString() === filters.vehicleId
                  ).map((vehicle) => {
                    const vehicleAssignments = tireAssignments?.filter(
                      assignment => assignment.vehicleId === vehicle.id && !assignment.removedAt
                    ) || [];
                    
                    const lastAssignment = tireAssignments?.filter(
                      assignment => assignment.vehicleId === vehicle.id
                    ).sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())[0];

                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                          <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicleAssignments.length} pneus ativos
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lastAssignment ? 
                            new Date(lastAssignment.assignedAt).toLocaleDateString('pt-BR') : 
                            "Nenhuma atribuição"
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={vehicleAssignments.length >= 4 ? 
                              "bg-success-100 text-success-800" : 
                              "bg-warning-100 text-warning-800"
                            }
                            variant="secondary"
                          >
                            {vehicleAssignments.length >= 4 ? "Completo" : "Incompleto"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {(filters.reportType === "costs" || filters.reportType === "maintenance") && (
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Relatório de {filters.reportType === "costs" ? "Custos" : "Manutenção"}</p>
              <p className="text-sm text-gray-400">Funcionalidade em desenvolvimento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Overview */}
      {dashboardStats && (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Resumo Geral da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalVehicles}</p>
                <p className="text-sm text-gray-600">Total de Veículos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeDrivers}</p>
                <p className="text-sm text-gray-600">Motoristas Ativos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.tiresInStock}</p>
                <p className="text-sm text-gray-600">Pneus em Estoque</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.alerts}</p>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

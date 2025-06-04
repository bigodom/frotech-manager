import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Car, Trash2, Settings, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMaintenanceAlertSchema } from "@shared/schema";
import type { InsertMaintenanceAlert, MaintenanceAlert, Vehicle } from "@shared/schema";

const maintenanceTypes = {
  revision: "Revisão",
  oil_change: "Troca de Óleo",
  brake_change: "Troca de Freio",
};

const maintenanceTypeColors = {
  revision: "bg-primary-100 text-primary-800",
  oil_change: "bg-warning-100 text-warning-800",
  brake_change: "bg-danger-100 text-danger-800",
};

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: maintenanceAlerts } = useQuery<MaintenanceAlert[]>({
    queryKey: ["/api/maintenance-alerts"],
  });

  const form = useForm<InsertMaintenanceAlert>({
    resolver: zodResolver(insertMaintenanceAlertSchema),
    defaultValues: {
      vehicleId: 0,
      maintenanceType: "revision",
      lastMaintenanceMileage: 0,
      intervalKm: 10000,
      isActive: true,
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: InsertMaintenanceAlert) => {
      const response = await apiRequest("POST", "/api/maintenance-alerts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
      toast({
        title: "Sucesso",
        description: "Alerta de manutenção criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar alerta de manutenção. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/maintenance-alerts/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Alerta de manutenção removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao remover alerta de manutenção. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMaintenanceAlert) => {
    createAlertMutation.mutate(data);
  };

  const handleDeleteAlert = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este alerta de manutenção?")) {
      deleteAlertMutation.mutate(id);
    }
  };

  // Get active alerts that need attention
  const activeAlerts = maintenanceAlerts?.filter(alert => {
    if (!alert.isActive) return false;
    const vehicle = vehicles?.find(v => v.id === alert.vehicleId);
    return vehicle && vehicle.currentMileage >= alert.nextDueMileage;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Active Alerts Section */}
      {activeAlerts.length > 0 && (
        <Card className="shadow-sm border border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas Ativos ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const vehicle = vehicles?.find(v => v.id === alert.vehicleId);
                const kmOverdue = vehicle ? vehicle.currentMileage - alert.nextDueMileage : 0;
                
                return (
                  <div key={alert.id} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {vehicle?.plate} - {maintenanceTypes[alert.maintenanceType as keyof typeof maintenanceTypes]}
                          </p>
                          <p className="text-sm text-red-600">
                            Manutenção vencida há {kmOverdue.toLocaleString()} km
                          </p>
                          <p className="text-xs text-gray-500">
                            Próxima manutenção era aos {alert.nextDueMileage.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800" variant="secondary">
                        Urgente
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Alert Form */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Criar Alerta de Manutenção</CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles?.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maintenanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Manutenção</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="revision">Revisão</SelectItem>
                        <SelectItem value="oil_change">Troca de Óleo</SelectItem>
                        <SelectItem value="brake_change">Troca de Freio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastMaintenanceMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM da Última Manutenção</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="45000" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo (KM)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10000" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <Button 
                  type="submit"
                  disabled={createAlertMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createAlertMutation.isPending ? "Criando..." : "Criar Alerta"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* All Maintenance Alerts */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Alertas de Manutenção Programados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!maintenanceAlerts || maintenanceAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum alerta de manutenção criado</p>
              <p className="text-sm text-gray-400">Use o formulário acima para criar o primeiro alerta</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Manutenção</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Manutenção</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próxima Manutenção</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maintenanceAlerts.map((alert) => {
                    const vehicle = vehicles?.find(v => v.id === alert.vehicleId);
                    const isOverdue = vehicle && vehicle.currentMileage >= alert.nextDueMileage;
                    const kmRemaining = vehicle ? alert.nextDueMileage - vehicle.currentMileage : 0;
                    
                    return (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Car className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vehicle?.plate}</div>
                              <div className="text-sm text-gray-500">{vehicle?.brand} {vehicle?.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={maintenanceTypeColors[alert.maintenanceType as keyof typeof maintenanceTypeColors]}
                            variant="secondary"
                          >
                            {maintenanceTypes[alert.maintenanceType as keyof typeof maintenanceTypes]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {alert.lastMaintenanceMileage.toLocaleString()} km
                          </div>
                          <div className="text-sm text-gray-500">
                            A cada {alert.intervalKm.toLocaleString()} km
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {alert.nextDueMileage.toLocaleString()} km
                          </div>
                          {!isOverdue && (
                            <div className="text-sm text-gray-500">
                              Faltam {kmRemaining.toLocaleString()} km
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              isOverdue 
                                ? "bg-red-100 text-red-800" 
                                : alert.isActive 
                                  ? "bg-success-100 text-success-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                            variant="secondary"
                          >
                            {isOverdue ? "Vencido" : alert.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteAlert(alert.id)}
                            disabled={deleteAlertMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
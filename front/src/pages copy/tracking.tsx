import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Car, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMileageRecordSchema } from "@shared/schema";
import type { InsertMileageRecord, Vehicle, MileageRecord } from "@shared/schema";

export default function Tracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: mileageRecords } = useQuery<MileageRecord[]>({
    queryKey: ["/api/mileage-records"],
  });

  const form = useForm<InsertMileageRecord>({
    resolver: zodResolver(insertMileageRecordSchema),
    defaultValues: {
      vehicleId: 0,
      mileage: 0,
      notes: "",
    },
  });

  const createMileageRecordMutation = useMutation({
    mutationFn: async (data: InsertMileageRecord) => {
      const response = await apiRequest("POST", "/api/mileage-records", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mileage-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      form.reset();
      toast({
        title: "Sucesso",
        description: "Quilometragem atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar quilometragem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMileageRecord) => {
    createMileageRecordMutation.mutate(data);
  };

  // Get recent records grouped by vehicle
  const recentRecords = mileageRecords?.slice(0, 5) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Mileage Update Form */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Atualizar Quilometragem</CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Quilometragem</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="45500" 
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button 
                  type="submit"
                  disabled={createMileageRecordMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {createMileageRecordMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        {/* Recent Updates */}
        <CardContent>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Atualizações Recentes</h4>
          {recentRecords.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma atualização de quilometragem registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => {
                const vehicle = vehicles?.find(v => v.id === record.vehicleId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Car className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle?.plate} • {record.mileage.toLocaleString()} km
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.recordDate).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {record.notes && (
                      <Badge variant="outline" className="text-xs">
                        {record.notes}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mileage Tracking Chart Placeholder */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Acompanhamento de Quilometragem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Gráfico de Quilometragem</p>
              <p className="text-sm text-gray-400">Integração com biblioteca de gráficos em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Status Overview */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Status dos Veículos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!vehicles || vehicles.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum veículo cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quilometragem Atual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quilometragem Inicial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rodado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => {
                    const totalMileage = vehicle.currentMileage - vehicle.initialMileage;
                    const statusColor = vehicle.status === "active" ? "bg-success-100 text-success-800" : 
                                      vehicle.status === "maintenance" ? "bg-warning-100 text-warning-800" : 
                                      "bg-gray-100 text-gray-800";
                    
                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Car className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                              <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.currentMileage.toLocaleString()} km
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicle.initialMileage.toLocaleString()} km
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {totalMileage.toLocaleString()} km
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusColor} variant="secondary">
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
        </CardContent>
      </Card>
    </div>
  );
}

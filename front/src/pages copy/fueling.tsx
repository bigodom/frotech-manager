import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Fuel, Car, Trash2, Receipt, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFuelingRecordSchema } from "@shared/schema";
import type { InsertFuelingRecord, FuelingRecord, Vehicle } from "@shared/schema";

const fuelTypes = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  diesel: "Diesel",
  flex: "Flex",
};

const fuelTypeColors = {
  gasoline: "bg-red-100 text-red-800",
  ethanol: "bg-green-100 text-green-800",
  diesel: "bg-yellow-100 text-yellow-800",
  flex: "bg-blue-100 text-blue-800",
};

export default function Fueling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: fuelingRecords, isLoading } = useQuery<FuelingRecord[]>({
    queryKey: ["/api/fueling-records"],
  });

  const form = useForm<InsertFuelingRecord>({
    resolver: zodResolver(insertFuelingRecordSchema),
    defaultValues: {
      vehicleId: 0,
      product: "gasoline",
      quantity: "0",
      unitPrice: "0",
      totalValue: "0",
      invoiceNumber: "",
      gasStation: "",
      mileage: 0,
    },
  });

  const createFuelingMutation = useMutation({
    mutationFn: async (data: InsertFuelingRecord) => {
      const response = await apiRequest("POST", "/api/fueling-records", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fueling-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
      toast({
        title: "Sucesso",
        description: "Registro de abastecimento criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar registro de abastecimento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteFuelingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/fueling-records/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fueling-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Registro de abastecimento removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao remover registro de abastecimento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFuelingRecord) => {
    createFuelingMutation.mutate(data);
  };

  const handleDeleteFueling = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este registro de abastecimento?")) {
      deleteFuelingMutation.mutate(id);
    }
  };

  // Calculate total value when quantity or unit price changes
  const watchQuantity = form.watch("quantity");
  const watchUnitPrice = form.watch("unitPrice");

  React.useEffect(() => {
    const quantity = parseFloat(watchQuantity || "0");
    const unitPrice = parseFloat(watchUnitPrice || "0");
    const total = (quantity * unitPrice).toFixed(2);
    form.setValue("totalValue", total);
  }, [watchQuantity, watchUnitPrice, form]);

  return (
    <div className="p-6 space-y-6">
      {/* Create Fueling Record Form */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Fuel className="w-5 h-5 mr-2" />
            Novo Registro de Abastecimento
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Nota</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Nota</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gasStation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posto</FormLabel>
                      <FormControl>
                        <Input placeholder="Posto Shell" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Abastecimento</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              {vehicle.plate} - {vehicle.name} {vehicle.model}
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
                      <FormLabel>Quilometragem</FormLabel>
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
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gasoline">Gasolina</SelectItem>
                          <SelectItem value="ethanol">Etanol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="flex">Flex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade (L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="50.000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário (R$/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="5.299" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="264.95" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={createFuelingMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createFuelingMutation.isPending ? "Salvando..." : "Salvar Registro"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Fueling Records List */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Registros de Abastecimento</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Carregando registros...</p>
            </div>
          ) : !fuelingRecords || fuelingRecords.length === 0 ? (
            <div className="p-8 text-center">
              <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum registro de abastecimento encontrado</p>
              <p className="text-sm text-gray-400">Use o formulário acima para criar o primeiro registro</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço/L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fuelingRecords.map((record) => {
                    const vehicle = vehicles?.find(v => v.id === record.vehicleId);
                    
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(record.fuelingDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            NF: {record.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Car className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vehicle?.plate}</div>
                              <div className="text-sm text-gray-500">{vehicle?.name} {vehicle?.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.gasStation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={fuelTypeColors[record.product as keyof typeof fuelTypeColors]}
                            variant="secondary"
                          >
                            {fuelTypes[record.product as keyof typeof fuelTypes]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {parseFloat(record.quantity).toFixed(3)} L
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {parseFloat(record.unitPrice).toFixed(3)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            R$ {parseFloat(record.totalValue).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.mileage.toLocaleString()} km
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteFueling(record.id)}
                            disabled={deleteFuelingMutation.isPending}
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
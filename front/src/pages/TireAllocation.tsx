// front/src/pages/TireAllocation.tsx

import { useState, useEffect } from 'react';
import { vehicleTirePositions } from '@/lib/VehiclesTires';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import api from '@/services/useApi';
import type { Vehicle } from '@/lib/types/Vehicle';
import type { Tire } from '@/lib/types/Tire';


type VehicleType = keyof typeof vehicleTirePositions;
const vehicleTypes: VehicleType[] = Object.keys(vehicleTirePositions) as VehicleType[];


export default function TireAllocation() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableTires, setAvailableTires] = useState<Tire[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('truck');
  const [allocatedTires, setAllocatedTires] = useState<Record<string, Tire | null>>(
    vehicleTirePositions['truck'].reduce((acc, pos) => ({ ...acc, [pos]: null }), {} as Record<string, Tire | null>)
  );

  useEffect(() => {
    // Carrega os veículos para o select
    api.get('/vehicle').then(response => setVehicles(response.data));

    // Carrega os pneus disponíveis (que não estão em nenhum veículo)
    // NOTA: O ideal seria ter um endpoint `/tire/available` no backend.
    // Por enquanto, estamos buscando todos e filtrando.
    api.get('/tire').then(response => {
      // TODO: Adicionar lógica para filtrar pneus já alocados
      setAvailableTires(response.data);
    });
  }, []);

  // Atualiza o diagrama e as posições dos pneus ao trocar o tipo de veículo
  useEffect(() => {
    setAllocatedTires(
      vehicleTirePositions[selectedVehicleType].reduce(
        (acc, pos) => ({ ...acc, [pos]: null }),
        {} as Record<string, Tire | null>
      )
    );
  }, [selectedVehicleType]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tire: Tire) => {
    e.dataTransfer.setData('tireId', tire.id.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, position: string) => {
    e.preventDefault();
    const tireId = e.dataTransfer.getData('tireId');
    const tireToAllocate = availableTires.find(t => t.id.toString() === tireId);

    if (tireToAllocate) {
      // Aloca o pneu na posição
      setAllocatedTires(prev => ({ ...prev, [position]: tireToAllocate }));
      // Remove o pneu da lista de disponíveis
      setAvailableTires(prev => prev.filter(t => t.id.toString() !== tireId));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleUnallocate = (position: string) => {
    const tireToUnallocate = allocatedTires[position];
    if(tireToUnallocate) {
      setAvailableTires(prev => [...prev, tireToUnallocate]);
      setAllocatedTires(prev => ({...prev, [position]: null}));
    }
  }

  const handleSaveAllocation = () => {
    if (!selectedVehicleId) {
      alert('Por favor, selecione um veículo.');
      return;
    }

    const allocationPromises = Object.entries(allocatedTires)
      .filter(([, tire]) => tire !== null)
      .map(([position, tire]) => {
        const payload = {
          veiculoId: parseInt(selectedVehicleId),
          pneuId: tire!.id,
          posicao: position,
          dataMontagem: new Date().toISOString(),
          kmMontagem: vehicles.find(v => v.id.toString() === selectedVehicleId)?.mileage || 0, 
        };
        return api.post('/vehicletire', payload);
      });

    Promise.all(allocationPromises)
      .then(() => {
        alert('Alocação salva com sucesso!');
        setAllocatedTires(
          vehicleTirePositions[selectedVehicleType].reduce((acc, pos) => ({ ...acc, [pos]: null }), {} as Record<string, Tire | null>)
        );
      })
      .catch(error => {
        console.error("Erro ao salvar alocação:", error);
        alert('Erro ao salvar alocação. Verifique o console.');
      });
  };

  // Componente para a representação visual do pneu
  const TireCard = ({ tire }: { tire: Tire }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, tire)}
      className="p-2 border rounded-md bg-gray-100 cursor-grab active:cursor-grabbing"
    >
      <p className="font-semibold">{tire.brand} {tire.model}</p>
      <p className="text-sm text-gray-600">Fogo: {tire.fireId}</p>
    </div>
  );

  // Componente para a posição do pneu no veículo
  const TireSlot = ({ position }: { position: string }) => {
    const tire = allocatedTires[position];
    return (
      <div
        onDrop={(e) => handleDrop(e, position)}
        onDragOver={handleDragOver}
        className="w-32 h-40 border-2 border-dashed rounded-lg flex items-center justify-center relative bg-gray-50"
      >
        {tire ? (
           <div className="text-center">
             <TireCard tire={tire} />
             <button 
                onClick={() => handleUnallocate(position)} 
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
               X
             </button>
           </div>
        ) : (
          <span className="text-xs text-gray-400 uppercase">{position}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alocação de Pneus</h1>
        <Button onClick={handleSaveAllocation} disabled={!selectedVehicleId}>Salvar Alocação</Button>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3">
          <label className="text-sm font-medium">Selecione um Veículo</label>
          <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um veículo..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                  {vehicle.plate} - {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/3">
          <label className="text-sm font-medium">Tipo de Veículo</label>
          <Select onValueChange={v => setSelectedVehicleType(v as VehicleType)} value={selectedVehicleType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map(type => (
                <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pneus Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="h-96 overflow-y-auto space-y-2">
            {availableTires.length > 0 ? availableTires.map(tire => (
              <TireCard key={tire.id} tire={tire} />
            )) : (
              <p className="text-gray-500 text-center">Nenhum pneu disponível.</p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Diagrama do Veículo ({selectedVehicleType.toUpperCase()})</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-gray-200 p-4 rounded-lg flex flex-wrap gap-4">
                {vehicleTirePositions[selectedVehicleType].map(position => (
                  <TireSlot key={position} position={position} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
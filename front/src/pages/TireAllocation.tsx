// front/src/pages/TireAllocation.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import api from '@/services/useApi';
import type { Vehicle } from '@/lib/types/Vehicle';
import type { Tire } from '@/lib/types/Tire';

// Posições dos eixos do veículo
const axlePositions = [
  'dianteiro_esquerdo', 'dianteiro_direito',
  'traseiro_esquerdo_interno', 'traseiro_esquerdo_externo',
  'traseiro_direito_interno', 'traseiro_direito_externo',
  'estepe_1', 'estepe_2'
];

export default function TireAllocation() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableTires, setAvailableTires] = useState<Tire[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [allocatedTires, setAllocatedTires] = useState<Record<string, Tire | null>>(
    axlePositions.reduce((acc, pos) => ({ ...acc, [pos]: null }), {})
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
          // Você pode adicionar um formulário para pegar o KM
          kmMontagem: vehicles.find(v => v.id.toString() === selectedVehicleId)?.mileage || 0, 
        };
        // Usando o endpoint que criamos anteriormente
        return api.post('/vehicletire', payload);
      });

    Promise.all(allocationPromises)
      .then(() => {
        alert('Alocação salva com sucesso!');
        // Limpar o estado após salvar
        setAllocatedTires(axlePositions.reduce((acc, pos) => ({ ...acc, [pos]: null }), {}));
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
          <span className="text-xs text-gray-400 capitalize">{position.replace(/_/g, ' ')}</span>
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
            <CardHeader><CardTitle>Diagrama do Veículo (Truck)</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-gray-200 p-4 rounded-lg">
                {/* Eixo Dianteiro */}
                <div className="flex justify-between mb-8">
                  <TireSlot position="dianteiro_esquerdo" />
                  <TireSlot position="dianteiro_direito" />
                </div>

                {/* Eixos Traseiros */}
                <div className="flex justify-between mb-4">
                  <TireSlot position="traseiro_esquerdo_externo" />
                  <TireSlot position="traseiro_direito_externo" />
                </div>
                <div className="flex justify-between">
                  <TireSlot position="traseiro_esquerdo_interno" />
                  <TireSlot position="traseiro_direito_interno" />
                </div>
                
                {/* Estepes */}
                <div className="flex justify-center gap-4 mt-8 pt-4 border-t">
                    <TireSlot position="estepe_1" />
                    <TireSlot position="estepe_2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
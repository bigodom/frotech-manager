import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Gauge } from "lucide-react"
import type { Vehicle, CreateVehicleDTO } from "../lib/types/Vehicle"
import { classificationOptions } from "@/lib/types/Vehicle"
import api from "@/services/useApi"

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isBatchUpdate, setIsBatchUpdate] = useState(false)
  const [batchResults, setBatchResults] = useState<Array<{ plate: string; success: boolean; error?: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showClass3, setShowClass3] = useState(false)
  const [showClass4, setShowClass4] = useState(false)
  const [showClass5, setShowClass5] = useState(false)

  const handleNewVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newVehicle: CreateVehicleDTO = {
      plate: formData.get("plate") as string,
      model: formData.get("model") as string,
      type: formData.get("type") as string,
      manufacturingYear: parseInt(formData.get("manufacturingYear") as string),
      modelYear: parseInt(formData.get("modelYear") as string),
      observation: formData.get("observation") as string,
      color: formData.get("color") as string,
      fuelType: formData.get("fuelType") as string,
      mileage: parseFloat(formData.get("mileage") as string) || 0,
      utility: formData.get("utility") as string,
      classification: parseInt(formData.get("classification") as string),
      registration: formData.get("registration") as string,
      chassi: formData.get("chassi") as string,
      fleet: parseInt(formData.get("fleet") as string),
      renavam: formData.get("renavam") as string,
    }

    api.post("/vehicle", newVehicle)
      .then(() => {
        fetchVehicles()
        setIsFormOpen(false)
      })
      .catch((error) => {
        console.error("Erro ao cadastrar veículo:", error)
      })
  }

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicle")
      // Ordena os veículos pela placa em ordem alfabética
      const sortedVehicles = response.data.sort((a: Vehicle, b: Vehicle) => 
        a.plate.localeCompare(b.plate)
      )
      setVehicles(sortedVehicles)
    } catch (error) {
      console.error("Erro ao buscar veículos:", error)
    }
  }

  const handleMileageUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const updatedVehicle: Partial<Vehicle> = {
      mileage: parseFloat(formData.get("mileage") as string) || 0,
    }

    try {
      await api.put(`/mileage/${selectedVehicle?.id}`, updatedVehicle)
      await fetchVehicles()
      setSelectedVehicle(null)
      setIsEditOpen(false)
    } catch (error) {
      console.error("Erro ao atualizar quilometragem:", error)
    }
  }

  const handleBatchMileageUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get("csvFile") as File

    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split("\n")
      // Remove a primeira linha (cabeçalho) e linhas vazias
      const updates = lines
        .slice(1) // Remove a primeira linha
        .filter(line => line.trim()) // Remove linhas vazias
        .map(line => {
          const [plate, mileage] = line.split(";").map(item => item.trim())
          return { plate, mileage: parseFloat(mileage) }
        })
        .filter(update => update.plate && !isNaN(update.mileage))

      const response = await api.put("/mileage-batch", { updates })
      setBatchResults(response.data)
      await fetchVehicles()
    } catch (error) {
      console.error("Erro ao processar arquivo CSV:", error)
    }
  }

  const handleEditVehicle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedVehicle) return

    try {
      await api.put(`/vehicle/${selectedVehicle.id}`, selectedVehicle)
      await fetchVehicles()
      setIsEditOpen(false)
      setSelectedVehicle(null)
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return

    if (window.confirm(`Tem certeza que deseja excluir o veículo ${selectedVehicle.plate}?`)) {
      try {
        await api.delete(`/vehicle/${selectedVehicle.id}`)
        await fetchVehicles()
        setIsEditOpen(false)
        setSelectedVehicle(null)
      } catch (error) {
        console.error("Erro ao excluir veículo:", error)
      }
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === "" || 
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClassification = 
      (vehicle.classification === 3 && showClass3) ||
      (vehicle.classification === 4 && showClass4) ||
      (vehicle.classification === 5 && showClass5) ||
      (!showClass3 && !showClass4 && !showClass5 && 
       vehicle.classification !== 3 && 
       vehicle.classification !== 4 && 
       vehicle.classification !== 5)

    return matchesSearch && matchesClassification
  })

  const getClassificationLabel = (classification?: number) => {
    if (!classification) return '-'
    const option = classificationOptions.find(opt => opt.value === classification)
    return option ? option.label : '-'
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Veículos</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Gauge className="mr-2 h-4 w-4" />
                Atualizar Quilometragem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atualizar Quilometragem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsBatchUpdate(!isBatchUpdate)}
                  >
                    {isBatchUpdate ? "Atualização Individual" : "Atualização em Lote"}
                  </Button>
                </div>

                {isBatchUpdate ? (
                  <form onSubmit={handleBatchMileageUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="csvFile">Arquivo CSV</Label>
                      <p className="text-sm text-gray-500">
                        O arquivo deve conter uma placa e quilometragem por linha, separados por ponto e vírgula (;).
                        A primeira linha deve ser o cabeçalho.
                        Exemplo:
                        Placa;Quilometragem
                        ABC1234;50000
                      </p>
                      <Input
                        id="csvFile"
                        name="csvFile"
                        type="file"
                        accept=".csv"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Atualizar em Lote</Button>
                    </div>
                    {batchResults.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Resultados:</h4>
                        <div className="max-h-40 overflow-auto">
                          {batchResults.map((result, index) => (
                            <div
                              key={index}
                              className={`text-sm ${
                                result.success ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {result.plate}: {result.success ? "Atualizado" : `Erro: ${result.error}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleMileageUpdate} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Veículo</Label>
                      <Select
                        value={selectedVehicle?.id.toString()}
                        onValueChange={(value) => {
                          const vehicle = vehicles.find(v => v.id.toString() === value)
                          setSelectedVehicle(vehicle || null)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um veículo" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.plate} - {vehicle.model} ({vehicle.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Nova Quilometragem</Label>
                      <Input
                        id="mileage"
                        name="mileage"
                        type="number"
                        placeholder="Digite a nova quilometragem"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Atualizar</Button>
                    </div>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Veículo</CardTitle>
            <CardDescription>
              Preencha os dados do veículo para cadastrá-lo na frota.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNewVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa *</Label>
                  <Input
                    id="plate"
                    name="plate"
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="Ex: Gol"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Input
                    id="type"
                    name="type"
                    placeholder="Ex: Carro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturingYear">Ano de Fabricação</Label>
                  <Input
                    id="manufacturingYear"
                    name="manufacturingYear"
                    type="number"
                    placeholder="Ex: 2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelYear">Ano do Modelo</Label>
                  <Input
                    id="modelYear"
                    name="modelYear"
                    type="number"
                    placeholder="Ex: 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="Ex: Preto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Tipo de Combustível</Label>
                  <Input
                    id="fuelType"
                    name="fuelType"
                    placeholder="Ex: Gasolina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Quilometragem</Label>
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    placeholder="Ex: 0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utility">Utilidade</Label>
                  <Input
                    id="utility"
                    name="utility"
                    placeholder="Ex: Transporte de Passageiros"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classification">Classificação</Label>
                  <Input
                    id="classification"
                    name="classification"
                    type="number"
                    placeholder="Ex: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration">Registro *</Label>
                  <Input
                    id="registration"
                    name="registration"
                    placeholder="Ex: 123456"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chassi">Chassi</Label>
                  <Input
                    id="chassi"
                    name="chassi"
                    placeholder="Ex: 9BWZZZ377VT004251"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fleet">Frota</Label>
                  <Input
                    id="fleet"
                    name="fleet"
                    placeholder="Ex: Frota 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renavam">Renavam</Label>
                  <Input
                    id="renavam"
                    name="renavam"
                    placeholder="Ex: 12345678901"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observation">Observação</Label>
                  <Input
                    id="observation"
                    name="observation"
                    placeholder="Ex: Veículo em bom estado"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Veículos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os veículos cadastrados na frota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filtrar por placa, modelo ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="class3"
                    checked={showClass3}
                    onChange={(e) => {
                      setShowClass3(e.target.checked)
                      if (e.target.checked) {
                        setShowClass4(false)
                        setShowClass5(false)
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="class3">{classificationOptions[2].label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="class4"
                    checked={showClass4}
                    onChange={(e) => {
                      setShowClass4(e.target.checked)
                      if (e.target.checked) {
                        setShowClass3(false)
                        setShowClass5(false)
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="class4">{classificationOptions[3].label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="class5"
                    checked={showClass5}
                    onChange={(e) => {
                      setShowClass5(e.target.checked)
                      if (e.target.checked) {
                        setShowClass3(false)
                        setShowClass4(false)
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="class5">{classificationOptions[4].label}</Label>
                </div>
              </div>
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quilometragem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Nenhum veículo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle)
                              setIsEditOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {vehicle.plate}
                          </button>
                        </TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{vehicle.mileage?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open)
        if (!open) {
          setIsEditMode(false)
          setSelectedVehicle(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo</DialogTitle>
          </DialogHeader>
          {isEditMode ? (
            <form onSubmit={handleEditVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-plate">Placa *</Label>
                  <Input
                    id="edit-plate"
                    value={selectedVehicle?.plate || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, plate: e.target.value} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Modelo *</Label>
                  <Input
                    id="edit-model"
                    value={selectedVehicle?.model || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, model: e.target.value} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Tipo *</Label>
                  <Input
                    id="edit-type"
                    value={selectedVehicle?.type || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, type: e.target.value} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-manufacturingYear">Ano de Fabricação *</Label>
                  <Input
                    id="edit-manufacturingYear"
                    type="number"
                    value={selectedVehicle?.manufacturingYear || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, manufacturingYear: parseInt(e.target.value)} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modelYear">Ano do Modelo *</Label>
                  <Input
                    id="edit-modelYear"
                    type="number"
                    value={selectedVehicle?.modelYear || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, modelYear: parseInt(e.target.value)} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Cor</Label>
                  <Input
                    id="edit-color"
                    value={selectedVehicle?.color || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, color: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fuelType">Tipo de Combustível</Label>
                  <Input
                    id="edit-fuelType"
                    value={selectedVehicle?.fuelType || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, fuelType: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mileage">Quilometragem</Label>
                  <Input
                    id="edit-mileage"
                    type="number"
                    value={selectedVehicle?.mileage || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, mileage: parseFloat(e.target.value)} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-utility">Utilidade</Label>
                  <Input
                    id="edit-utility"
                    value={selectedVehicle?.utility || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, utility: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-classification">Classificação</Label>
                  <Input
                    id="edit-classification"
                    type="number"
                    value={selectedVehicle?.classification || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, classification: parseInt(e.target.value)} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-registration">Registro *</Label>
                  <Input
                    id="edit-registration"
                    value={selectedVehicle?.registration || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, registration: e.target.value} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-chassi">Chassi</Label>
                  <Input
                    id="edit-chassi"
                    value={selectedVehicle?.chassi || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, chassi: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fleet">Frota</Label>
                  <Input
                    id="edit-fleet"
                    value={selectedVehicle?.fleet || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, fleet: parseInt(e.target.value)} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-renavam">Renavam</Label>
                  <Input
                    id="edit-renavam"
                    value={selectedVehicle?.renavam || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, renavam: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-observation">Observação</Label>
                  <Input
                    id="edit-observation"
                    value={selectedVehicle?.observation || ''}
                    onChange={(e) => setSelectedVehicle(prev => prev ? {...prev, observation: e.target.value} : null)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteVehicle}
                >
                  Excluir
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.plate}</p>
                </div>
                <div>
                  <Label>Modelo</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.model}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.type}</p>
                </div>
                <div>
                  <Label>Ano de Fabricação</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.manufacturingYear}</p>
                </div>
                <div>
                  <Label>Ano do Modelo</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.modelYear}</p>
                </div>
                <div>
                  <Label>Cor</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.color || '-'}</p>
                </div>
                <div>
                  <Label>Tipo de Combustível</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.fuelType || '-'}</p>
                </div>
                <div>
                  <Label>Quilometragem</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.mileage?.toLocaleString() || '-'}</p>
                </div>
                <div>
                  <Label>Utilidade</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.utility || '-'}</p>
                </div>
                <div>
                  <Label>Classificação</Label>
                  <p className="text-sm text-gray-600">{getClassificationLabel(selectedVehicle?.classification)}</p>
                </div>
                <div>
                  <Label>Registro</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.registration}</p>
                </div>
                <div>
                  <Label>Chassi</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.chassi || '-'}</p>
                </div>
                <div>
                  <Label>Frota</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.fleet || '-'}</p>
                </div>
                <div>
                  <Label>Renavam</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.renavam || '-'}</p>
                </div>
                <div className="col-span-2">
                  <Label>Observação</Label>
                  <p className="text-sm text-gray-600">{selectedVehicle?.observation || '-'}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteVehicle}
                >
                  Excluir
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={handleEditClick}>
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
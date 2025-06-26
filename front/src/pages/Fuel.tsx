import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { CreateFuelDTO, Fuel } from "@/lib/types/Fuel"
import api from "@/services/useApi"
import { formatDate } from "@/lib/utils"

export default function Fuel() {
  const [fuels, setFuels] = useState<Fuel[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedFuel, setSelectedFuel] = useState<Fuel | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)

  const handleNewFuel = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const newFuel: CreateFuelDTO = {
      invoiceId: parseInt(formData.get("invoiceId") as string),
      issuer: formData.get("issuer") as string,
      invoiceDate: new Date(formData.get("invoiceDate") as string),
      date: new Date(formData.get("date") as string),
      plate: formData.get("plate") as string,
      kilometers: parseInt(formData.get("kilometers") as string),
      fuelType: formData.get("fuelType") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      unitCost: parseFloat(formData.get("unitCost") as string),
      totalCost: parseFloat(formData.get("totalCost") as string)
    }

    api.post("/fuel", newFuel)
      .then(() => {
        fetchFuels()
        setIsFormOpen(false)
      })
      .catch((error) => {
        console.error("Erro ao cadastrar abastecimento:", error.response?.data || error)
      })
  }

  const handleEditFuel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFuel) return

    try {
      await api.put(`/fuel/${selectedFuel.id}`, selectedFuel)
      await fetchFuels()
      setIsEditOpen(false)
      setSelectedFuel(null)
    } catch (error) {
      console.error("Erro ao atualizar abastecimento:", error)
    }
  }

  const handleDeleteFuel = async () => {
    if (!selectedFuel) return
      try {
        await api.delete(`/fuel/${selectedFuel.id}`)
        await fetchFuels()
        setIsEditOpen(false)
        setSelectedFuel(null)
      } catch (error) {
        console.error("Erro ao excluir abastecimento:", error)
      }

  }

  const fetchFuels = async () => {
    try {
      const response = await api.get("/fuel")
      const sortedFuels = response.data.sort((a: Fuel, b: Fuel) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setFuels(sortedFuels)
    } catch (error) {
      console.error("Erro ao buscar abastecimentos:", error)
    }
  }

  const filteredFuels = fuels.filter(fuel =>
    searchTerm === "" || 
    fuel.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fuel.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  useEffect(() => {
    fetchFuels()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])


  const totalPages = Math.ceil(filteredFuels.length / PAGE_SIZE)
  const paginatedFuels = filteredFuels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Abastecimentos</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Abastecimento
        </Button>
      </div>

      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Abastecimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewFuel} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Número da Nota *</Label>
                  <Input id="invoiceId" name="invoiceId" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Emissor *</Label>
                  <Input id="issuer" name="issuer" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Data da Nota *</Label>
                  <Input type="date" id="invoiceDate" name="invoiceDate" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data do Abastecimento *</Label>
                  <Input type="date" id="date" name="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa *</Label>
                  <Input id="plate" name="plate" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kilometers">Quilometragem *</Label>
                  <Input id="kilometers" name="kilometers" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Tipo de Combustível *</Label>
                  <Input id="fuelType" name="fuelType" required></Input>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade (L) *</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Custo Unitário (R$) *</Label>
                  <Input id="unitCost" name="unitCost" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCost">Custo Total (R$) *</Label>
                  <Input id="totalCost" name="totalCost" type="number" step="0.01" required />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Abastecimentos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os abastecimentos registrados na frota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filtrar por placa ou emissor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFuels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Nenhum abastecimento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFuels.map((fuel) => (
                      <TableRow key={fuel.id}>
                        <TableCell>{fuel.plate}</TableCell>
                        <TableCell>{fuel.issuer}</TableCell>
                        <TableCell>{formatDate(fuel.date)}</TableCell>
                        <TableCell>{fuel.fuelType}</TableCell>
                        <TableCell>{fuel.quantity} L</TableCell>
                        <TableCell>R$ {fuel.totalCost.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFuel(fuel)
                                setIsEditOpen(true)
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedFuel(fuel)
                                handleDeleteFuel()
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span className="self-center">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditOpen && selectedFuel && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Abastecimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditFuel} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceId">Número da Nota</Label>
                  <Input
                    id="edit-invoiceId"
                    value={selectedFuel.invoiceId}
                    onChange={(e) => setSelectedFuel({...selectedFuel, invoiceId: parseInt(e.target.value)})}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-issuer">Emissor</Label>
                  <Input
                    id="edit-issuer"
                    value={selectedFuel.issuer}
                    onChange={(e) => setSelectedFuel({...selectedFuel, issuer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceDate">Data da Nota</Label>
                  <Input
                    type="date"
                    id="edit-invoiceDate"
                    value={selectedFuel.invoiceDate.toString().split('T')[0]}
                    onChange={(e) => setSelectedFuel({...selectedFuel, invoiceDate: new Date(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data do Abastecimento</Label>
                  <Input
                    type="date"
                    id="edit-date"
                    value={selectedFuel.date.toString().split('T')[0]}
                    onChange={(e) => setSelectedFuel({...selectedFuel, date: new Date(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plate">Placa</Label>
                  <Input
                    id="edit-plate"
                    value={selectedFuel.plate}
                    onChange={(e) => setSelectedFuel({...selectedFuel, plate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-kilometers">Quilometragem</Label>
                  <Input
                    id="edit-kilometers"
                    value={selectedFuel.kilometers}
                    onChange={(e) => setSelectedFuel({...selectedFuel, kilometers: parseInt(e.target.value)})}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fuelType">Tipo de Combustível</Label>
                  <Select
                    value={selectedFuel.fuelType}
                    onValueChange={(value) => setSelectedFuel({...selectedFuel, fuelType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Gasolina", "Etanol", "Diesel", "GNV", "Flex"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade (L)</Label>
                  <Input
                    id="edit-quantity"
                    value={selectedFuel.quantity}
                    onChange={(e) => setSelectedFuel({...selectedFuel, quantity: parseFloat(e.target.value)})}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unitCost">Custo Unitário (R$)</Label>
                  <Input
                    id="edit-unitCost"
                    value={selectedFuel.unitCost}
                    onChange={(e) => setSelectedFuel({...selectedFuel, unitCost: parseFloat(e.target.value)})}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-totalCost">Custo Total (R$)</Label>
                  <Input
                    id="edit-totalCost"
                    value={selectedFuel.totalCost}
                    onChange={(e) => setSelectedFuel({...selectedFuel, totalCost: parseFloat(e.target.value)})}
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 
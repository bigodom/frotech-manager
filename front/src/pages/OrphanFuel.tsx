import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Fuel } from "@/lib/types/Fuel"
import api from "@/services/useApi"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

export default function OrphanFuel() {
  const [fuels, setFuels] = useState<Fuel[]>([])
  const [selectedFuel, setSelectedFuel] = useState<Fuel | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)

  const handleEditFuel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFuel) return

    try {
      await api.put(`/fuel/${selectedFuel.id}`, selectedFuel)
      await fetchFuels()
      setIsEditOpen(false)
      setSelectedFuel(null)
      toast.success("Abastecimento atualizado com sucesso!" + ` Placa: ${selectedFuel.plate}`)
    } catch (error) {
      console.error("Erro ao atualizar abastecimento:", error)
    }
  }

  const fetchFuels = async () => {
    try {
      const response = await api.get("/orphaned/fuel")
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
        <h1 className="text-3xl font-bold">Abastecimentos Órfãos</h1>
      </div>
        <h2 className="text-2xl">Abastecimentos que não possuem veículos cadastrados</h2>

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
                  <Input
                    id="edit-fuelType"
                    value={selectedFuel.fuelType}
                    onChange={(e) => setSelectedFuel({...selectedFuel, fuelType: e.target.value})}
                  />
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
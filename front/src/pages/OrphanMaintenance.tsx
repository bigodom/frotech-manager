import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Maintenance } from "@/lib/types/Maintenance"
import api from "@/services/useApi"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

export default function OrphanMaintenance() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)

  const handleEditMaintenance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMaintenance) return

    try {
      await api.put(`/maintenance/${selectedMaintenance.id}`, selectedMaintenance)
      await fetchMaintenances()
      setIsEditOpen(false)
      setSelectedMaintenance(null)
      toast.success("Manutenção atualizada com sucesso!" + ` Placa: ${selectedMaintenance.plate}`)
    } catch (error) {
      console.error("Erro ao atualizar manutenção:", error)
    }
  }

  const fetchMaintenances = async () => {
    try {
      const response = await api.get("/orphaned/maintenance")
      const sortedMaintenances = response.data.sort((a: Maintenance, b: Maintenance) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setMaintenances(sortedMaintenances)
    } catch (error) {
      console.error("Erro ao buscar manutenções:", error)
    }
  }

  const filteredMaintenances = maintenances.filter(maintenance =>
    searchTerm === "" || 
    maintenance.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maintenance.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchMaintenances()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const totalPages = Math.ceil(filteredMaintenances.length / PAGE_SIZE)
  const paginatedMaintenances = filteredMaintenances.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manutenções Órfãs</h1>
      </div>
      <h2 className="text-2xl">Manutenções que não possuem veículos cadastrados</h2>

      <Card>
        <CardHeader>
          <CardTitle>Manutenções Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as manutenções registradas na frota sem vínculo com veículos cadastrados.
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMaintenances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Nenhuma manutenção encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMaintenances.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell>{maintenance.plate}</TableCell>
                        <TableCell>{maintenance.issuer}</TableCell>
                        <TableCell>{maintenance.date ? formatDate(maintenance.date) : ""}</TableCell>
                        <TableCell>{maintenance.description}</TableCell>
                        <TableCell>{maintenance.quantity}</TableCell>
                        <TableCell>R$ {maintenance.value?.toFixed(2)}</TableCell>
                        <TableCell>R$ {maintenance.totalCost?.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMaintenance(maintenance)
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

      {isEditOpen && selectedMaintenance && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Manutenção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditMaintenance} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceId">Número da Nota</Label>
                  <Input
                    id="edit-invoiceId"
                    value={selectedMaintenance.invoiceId}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, invoiceId: parseInt(e.target.value)})}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-issuer">Emissor</Label>
                  <Input
                    id="edit-issuer"
                    value={selectedMaintenance.issuer}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, issuer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceDate">Data da Nota</Label>
                  <Input
                    type="date"
                    id="edit-invoiceDate"
                    value={selectedMaintenance.invoiceDate ? new Date(selectedMaintenance.invoiceDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, invoiceDate: new Date(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data da Manutenção</Label>
                  <Input
                    type="date"
                    id="edit-date"
                    value={selectedMaintenance.date ? new Date(selectedMaintenance.date).toISOString().split('T')[0] : ""}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, date: new Date(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plate">Placa</Label>
                  <Input
                    id="edit-plate"
                    value={selectedMaintenance.plate}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, plate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Input
                    id="edit-description"
                    value={selectedMaintenance.description}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade</Label>
                  <Input
                    id="edit-quantity"
                    value={selectedMaintenance.quantity}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, quantity: parseFloat(e.target.value)})}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Valor Unitário (R$)</Label>
                  <Input
                    id="edit-value"
                    value={selectedMaintenance.value}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, value: parseFloat(e.target.value)})}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-totalCost">Custo Total (R$)</Label>
                  <Input
                    id="edit-totalCost"
                    value={selectedMaintenance.totalCost}
                    onChange={(e) => setSelectedMaintenance({...selectedMaintenance, totalCost: parseFloat(e.target.value)})}
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 
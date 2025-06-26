import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { Maintenance, CreateMaintenanceDTO } from "@/lib/types/Maintenance"
import api from "@/services/useApi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"

const PAGE_SIZE = 10

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchPlate, setSearchPlate] = useState("")

  useEffect(() => {
    fetchMaintenances()
  }, [])

  const fetchMaintenances = async () => {
    try {
      const response = await api.get("/maintenance")
      // Ordena por data decrescente
      const sorted = response.data.sort((a: Maintenance, b: Maintenance) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setMaintenances(sorted)
    } catch (error) {
      console.error("Erro ao buscar manutenções:", error)
    }
  }

  const handleNewMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newMaintenance: CreateMaintenanceDTO = {
      invoiceId: Number(formData.get("invoiceId")),
      invoiceDate: new Date(formData.get("invoiceDate") as string),
      issuer: formData.get("issuer") as string,
      date: new Date(formData.get("date") as string),
      plate: formData.get("plate") as string,
      description: formData.get("description") as string,
      quantity: Number(formData.get("quantity")),
      value: Number(formData.get("value")),
      totalCost: Number(formData.get("totalCost")),
    }
    try {
      await api.post("/maintenance", newMaintenance)
      await fetchMaintenances()
      setIsFormOpen(false)
    } catch (error) {
      console.error("Erro ao cadastrar manutenção:", error)
    }
  }

  const handleEditClick = () => setIsEditMode(true)
  const handleCancelEdit = () => setIsEditMode(false)

  const handleEditMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaintenance) return
    try {
      await api.put(`/maintenance/${selectedMaintenance.id}`, selectedMaintenance)
      await fetchMaintenances()
      setIsEditOpen(false)
      setSelectedMaintenance(null)
      setIsEditMode(false)
    } catch (error) {
      console.error("Erro ao atualizar manutenção:", error)
    }
  }

  const handleDeleteMaintenance = async () => {
    if (!selectedMaintenance) return
    if (window.confirm(`Tem certeza que deseja excluir a manutenção?`)) {
      try {
        await api.delete(`/maintenance/${selectedMaintenance.id}`)
        await fetchMaintenances()
        setIsEditOpen(false)
        setSelectedMaintenance(null)
        setIsEditMode(false)
      } catch (error) {
        console.error("Erro ao excluir manutenção:", error)
      }
    }
  }

  // Paginação e filtro
  const filteredMaintenances = maintenances.filter(m =>
    searchPlate === "" || m.plate.toLowerCase().includes(searchPlate.toLowerCase())
  )
  const totalPages = Math.ceil(filteredMaintenances.length / PAGE_SIZE)
  const paginatedMaintenances = filteredMaintenances.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manutenções</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Manutenção
        </Button>
      </div>

      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Manutenção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewMaintenance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input id="description" name="description" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCost">Custo Total *</Label>
                  <Input id="totalCost" name="totalCost" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa *</Label>
                  <Input id="plate" name="plate" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Nota Fiscal *</Label>
                  <Input id="invoiceId" name="invoiceId" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Data da Nota *</Label>
                  <Input id="invoiceDate" name="invoiceDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Emissor *</Label>
                  <Input id="issuer" name="issuer" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor Unitário *</Label>
                  <Input id="value" name="value" type="number" step="0.01" required />
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
          <CardTitle>Histórico de Manutenções</CardTitle>
          <div className="mt-2">
            <Input
              placeholder="Filtrar por placa..."
              value={searchPlate}
              onChange={e => {
                setSearchPlate(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[calc(100vh-300px)] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Custo Total (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Nenhuma manutenção encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMaintenances.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.plate}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => {
                            setSelectedMaintenance(m)
                            setIsEditOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {m.description}
                        </button>
                      </TableCell>
                      <TableCell>{formatDate(m.date)}</TableCell>
                      <TableCell>{m.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Paginação */}
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

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open)
        if (!open) {
          setIsEditMode(false)
          setSelectedMaintenance(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Manutenção</DialogTitle>
          </DialogHeader>
          {isEditMode ? (
            <form onSubmit={handleEditMaintenance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição *</Label>
                  <Input
                    id="edit-description"
                    value={selectedMaintenance?.description || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, description: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={selectedMaintenance?.date ? new Date(selectedMaintenance.date).toISOString().split('T')[0] : ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, date: new Date(e.target.value) } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-totalCost">Custo Total *</Label>
                  <Input
                    id="edit-totalCost"
                    type="number"
                    step="0.01"
                    value={selectedMaintenance?.totalCost || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, totalCost: Number(e.target.value) } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plate">Placa *</Label>
                  <Input
                    id="edit-plate"
                    value={selectedMaintenance?.plate || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, plate: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceId">Nota Fiscal *</Label>
                  <Input
                    id="edit-invoiceId"
                    type="number"
                    value={selectedMaintenance?.invoiceId || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, invoiceId: Number(e.target.value) } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceDate">Data da Nota *</Label>
                  <Input
                    id="edit-invoiceDate"
                    type="date"
                    value={selectedMaintenance?.invoiceDate ? new Date(selectedMaintenance.invoiceDate).toISOString().split('T')[0] : ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, invoiceDate: new Date(e.target.value) } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-issuer">Emissor *</Label>
                  <Input
                    id="edit-issuer"
                    value={selectedMaintenance?.issuer || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, issuer: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.01"
                    value={selectedMaintenance?.quantity || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Valor Unitário *</Label>
                  <Input
                    id="edit-value"
                    type="number"
                    step="0.01"
                    value={selectedMaintenance?.value || ''}
                    onChange={e => setSelectedMaintenance(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="destructive" onClick={handleDeleteMaintenance}>
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
                  <Label>Descrição</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.description}</p>
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.date ? formatDate(selectedMaintenance.date) : '-'}</p>
                </div>
                <div>
                  <Label>Custo Total</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div>
                  <Label>Placa</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.plate}</p>
                </div>
                <div>
                  <Label>Nota Fiscal</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.invoiceId}</p>
                </div>
                <div>
                  <Label>Data da Nota</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.invoiceDate ? formatDate(selectedMaintenance.invoiceDate) : '-'}</p>
                </div>
                <div>
                  <Label>Emissor</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.issuer}</p>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.quantity}</p>
                </div>
                <div>
                  <Label>Valor Unitário</Label>
                  <p className="text-sm text-gray-600">{selectedMaintenance?.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="destructive" onClick={handleDeleteMaintenance}>
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

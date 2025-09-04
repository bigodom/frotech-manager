import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { Alerts } from "@/lib/types/Alerts"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/services/useApi"
import type { Vehicle } from "@/lib/types/Vehicle"
import { utils } from "xlsx"

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alerts[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: 0,
    type: "",
    description: "",
    value: undefined,
    doneDate: "",
    kmAlert: 0,
  })
  const [customType, setCustomType] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean, alert: Alerts | null }>({ open: false, alert: null })
  const [completeData, setCompleteData] = useState({
    value: '',
    doneDate: '',
    repeat: false,
    nextKmAlert: ''
  })
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean, alert: Alerts | null, edit: boolean }>({ open: false, alert: null, edit: false })
  const [editData, setEditData] = useState<any>({})

  // Buscar alertas do backend
  const fetchAlerts = async () => {
    try {
      const response = await api.get("/alerts")
      setAlerts(response.data)
    } catch (error) {
      toast.warning("Erro ao buscar alertas!")
    }
  }

  useEffect(() => {
    fetchAlerts()
    async function fetchVehicles() {
      try {
        const response = await api.get("/vehicle")
        setVehicles(response.data)
      } catch (error) {
        toast.warning("Erro ao buscar veículos!")
      }
    }
    fetchVehicles()
  }, [])

  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.isCompleted && alert.vehicle && typeof alert.vehicle.mileage === 'number' && alert.kmAlert > 0) {
        if (alert.vehicle.mileage >= alert.kmAlert - 1000 && alert.vehicle.mileage < alert.kmAlert) {
          toast.info(`O veículo de placa ${alert.vehicle.plate} está a menos de 1000km do alerta: ${alert.description || alert.type}`)
        }
      }
    })
  }, [alerts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        vehicleId: Number(formData.vehicleId),
        type: formData.type === "other" ? customType : formData.type,
        description: formData.description,
        value: formData.value ? Number(formData.value) : undefined,
        kmAlert: Number(formData.kmAlert),
      }
      await api.post("/alerts", payload)
      toast.success("Alerta cadastrado com sucesso!")
      setIsFormOpen(false)
      setFormData({
        vehicleId: 0,
        type: "",
        description: "",
        value: undefined,
        doneDate: "",
        kmAlert: 0,
      })
      fetchAlerts()
    } catch (error) {
      toast.warning("Erro ao cadastrar alerta!")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Função para concluir alerta
  const handleComplete = (alert: Alerts) => {
    setCompleteDialog({ open: true, alert })
    setCompleteData({ value: '', doneDate: formatDate(new Date()), repeat: false, nextKmAlert: '' })
  }

  const handleCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setCompleteData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleConfirmComplete = async () => {
    if (!completeDialog.alert) return
    try {
      await api.patch(`/alerts/${completeDialog.alert.id}/complete`, {
        value: Number(completeData.value),
        doneDate: completeData.doneDate,
        repeat: completeData.repeat,
        nextKmAlert: completeData.repeat ? completeData.nextKmAlert : undefined
      })
      toast.success('Alerta concluído com sucesso!')
      setCompleteDialog({ open: false, alert: null })
      fetchAlerts()
    } catch (error) {
      toast.warning('Erro ao concluir alerta!')
    }
  }

  const handleRowClick = (alert: Alerts) => {
    setDetailsDialog({ open: true, alert, edit: false })
    setEditData(alert)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setEditData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSaveEdit = async () => {
    if (!detailsDialog.alert) return
    try {
      // Filtra apenas os campos permitidos
      const payload = {
        vehicleId: editData.vehicleId,
        type: editData.type,
        description: editData.description,
        value: editData.value,
        doneDate: editData.doneDate,
        kmAlert: editData.kmAlert,
        isCompleted: editData.isCompleted
      }
      await api.put(`/alerts/${detailsDialog.alert.id}`, payload)
      toast.success('Alerta atualizado com sucesso!')
      setDetailsDialog({ open: false, alert: null, edit: false })
      fetchAlerts()
    } catch (error) {
      toast.warning('Erro ao atualizar alerta!')
    }
  }

  const handleDeleteAlert = async () => {
    if (!detailsDialog.alert) return
    if (!window.confirm('Tem certeza que deseja excluir este alerta?')) return
    try {
      await api.delete(`/alerts/${detailsDialog.alert.id}`)
      toast.success('Alerta excluído com sucesso!')
      setDetailsDialog({ open: false, alert: null, edit: false })
      fetchAlerts()
    } catch (error) {
      toast.warning('Erro ao excluir alerta!')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alertas</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Alerta
        </Button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="showCompleted"
          checked={showCompleted}
          onChange={() => setShowCompleted((v) => !v)}
        />
        <Label htmlFor="showCompleted">Exibir apenas alertas concluídos</Label>
      </div>

      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Alerta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Alerta</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      handleSelectChange("type", value)
                      if (value !== "other") setCustomType("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revisão">Revisão</SelectItem>
                      <SelectItem value="manutenção">Manutenção</SelectItem>
                      <SelectItem value="inspeção">Inspeção</SelectItem>
                      <SelectItem value="documento">Documentação</SelectItem>
                      <SelectItem value="pneu">Pneu</SelectItem>
                      <SelectItem value="combustível">Combustível</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.type === "other" && (
                    <Input
                      className="mt-2"
                      placeholder="Digite o tipo de alerta"
                      value={customType}
                      onChange={e => setCustomType(e.target.value)}
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleId">Veículo</Label>
                  <Select
                    value={formData.vehicleId ? String(formData.vehicleId) : ""}
                    onValueChange={value => handleSelectChange("vehicleId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.plate} - {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmAlert">KM Alerta</Label>
                  <Input
                    id="kmAlert"
                    name="kmAlert"
                    type="number"
                    value={formData.kmAlert}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o alerta"
                    required
                  />
                </div>
                {/* Removido campo valor */}
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
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para concluir alerta */}
      <Dialog open={completeDialog.open} onOpenChange={open => setCompleteDialog({ open, alert: open ? completeDialog.alert : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Concluir Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="complete-value">Valor</Label>
              <Input id="complete-value" name="value" type="number" value={completeData.value} onChange={handleCompleteChange} required />
            </div>
            <div>
              <Label htmlFor="complete-doneDate">Data de Conclusão</Label>
              <Input id="complete-doneDate" name="doneDate" type="date" value={completeData.doneDate} onChange={handleCompleteChange} required />
            </div>
            <div className="flex items-center gap-2">
              <input id="complete-repeat" name="repeat" type="checkbox" checked={completeData.repeat} onChange={handleCompleteChange} />
              <Label htmlFor="complete-repeat">Repetir alerta</Label>
            </div>
            {completeData.repeat && (
              <div>
                <Label htmlFor="complete-nextKmAlert">Nova KM de Alerta</Label>
                <Input id="complete-nextKmAlert" name="nextKmAlert" type="number" value={completeData.nextKmAlert} onChange={handleCompleteChange} required={completeData.repeat} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompleteDialog({ open: false, alert: null })}>Cancelar</Button>
              <Button onClick={handleConfirmComplete}>Concluir</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalhes/edição do alerta */}
      <Dialog open={detailsDialog.open} onOpenChange={open => setDetailsDialog({ open, alert: open ? detailsDialog.alert : null, edit: false })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Alerta</DialogTitle>
          </DialogHeader>
          {detailsDialog.alert ? (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveEdit() }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Input name="type" value={editData.type || ''} onChange={handleEditChange} disabled={!detailsDialog.edit} />
                </div>
                <div>
                  <Label>Veículo</Label>
                  {detailsDialog.edit ? (
                    <Select
                      value={editData.vehicleId ? String(editData.vehicleId) : ''}
                      onValueChange={value => setEditData((prev: any) => ({ ...prev, vehicleId: Number(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.plate} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={detailsDialog.alert.vehicle?.plate || ''} disabled />
                  )}
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input name="description" value={editData.description || ''} onChange={handleEditChange} disabled={!detailsDialog.edit} />
                </div>
                <div>
                  <Label>KM Alerta</Label>
                  <Input name="kmAlert" type="number" value={editData.kmAlert || ''} onChange={handleEditChange} disabled={!detailsDialog.edit} />
                </div>
                <div>
                  <Label>KM Atual</Label>
                  <Input value={detailsDialog.alert.vehicle?.mileage || ''} disabled />
                </div>
                <div>
                  <Label>Concluído</Label>
                  <Input value={detailsDialog.alert.isCompleted ? 'Sim' : 'Não'} disabled />
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-4">
                <Button type="button" variant="destructive" onClick={handleDeleteAlert}>Excluir</Button>
                <div className="flex gap-2">
                  {!detailsDialog.edit ? (
                    <Button type="button" onClick={() => setDetailsDialog(d => ({ ...d, edit: true }))}>Editar</Button>
                  ) : (
                    <>
                      <Button type="button" variant="outline" onClick={() => setDetailsDialog(d => ({ ...d, edit: false }))}>Cancelar</Button>
                      <Button type="submit">Salvar</Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
          <CardDescription>
            Lista de todos os alertas do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>KM Alerta</TableHead>
                <TableHead>KM Atual</TableHead>
                <TableHead>Concluído</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.filter(a => a.isCompleted === showCompleted).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Nenhum alerta encontrado
                  </TableCell>
                </TableRow>
              ) : (
                alerts.filter(a => a.isCompleted === showCompleted).map((alert) => (
                  <TableRow key={alert.id} onClick={() => handleRowClick(alert)} className="cursor-pointer hover:bg-gray-100">
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{alert.vehicle?.plate || alert.vehicleId}</TableCell>
                    <TableCell>{alert.description}</TableCell>
                    <TableCell>{alert.kmAlert}</TableCell>
                    <TableCell>{alert.vehicle?.mileage}</TableCell>
                    <TableCell>{alert.isCompleted ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{new Date(alert.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(alert.updatedAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {!alert.isCompleted && (
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleComplete(alert) }}>
                          Concluir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 
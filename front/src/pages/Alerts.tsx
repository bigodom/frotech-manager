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

import { toast } from "sonner"
import api from "@/services/useApi"
import type { Vehicle } from "@/lib/types/Vehicle"

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
    isCompleted: false,
    priority: "medium",
    status: "pending"
  })
  const [customType, setCustomType] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAlert: Alerts = {
      id: Math.floor(Math.random() * 1000000),
      vehicleId: Number(formData.vehicleId),
      type: formData.type === "other" ? customType : formData.type,
      description: formData.description,
      value: formData.value ? Number(formData.value) : undefined,
      doneDate: formData.doneDate ? new Date(formData.doneDate) : undefined,
      kmAlert: Number(formData.kmAlert),
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setAlerts([...alerts, newAlert])
    setFormData({
      vehicleId: 0,
      type: "",
      description: "",
      value: undefined,
      doneDate: "",
      kmAlert: 0,
      isCompleted: false,
      priority: "medium",
      status: "pending"
    })
    setIsFormOpen(false)
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

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await api.get("/vehicle")
        setVehicles(response.data)
      } catch (error) {
        console.error("Erro ao buscar veículos:", error)
      }
    }
    fetchVehicles()
    toast.warning("Carregando veículos...", { duration: 2000, icon: "🔄" })
  }, [])

  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.isCompleted) {
        const vehicle = vehicles.find(v => v.id === alert.vehicleId)
        if (vehicle && typeof vehicle.mileage === 'number' && alert.kmAlert > 0) {
          if (vehicle.mileage >= alert.kmAlert - 500 && vehicle.mileage < alert.kmAlert) {
            toast(`O veículo de placa ${vehicle.plate} está a menos de 500km do alerta: ${alert.description || alert.type}`)
          }
        }
      }
    })
  }, [alerts, vehicles])

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
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inspection">Inspeção</SelectItem>
                      <SelectItem value="document">Documentação</SelectItem>
                      <SelectItem value="tire">Pneu</SelectItem>
                      <SelectItem value="fuel">Combustível</SelectItem>
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
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleSelectChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleId">Veículo</Label>
                  <Input
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId.toString()}
                    onChange={handleChange}
                    placeholder="Ex: 1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data Limite</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.doneDate}
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
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
          </DialogContent>
        </Dialog>
      )}

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
                <TableHead>Data Limite</TableHead>
                <TableHead>KM Alerta</TableHead>
                <TableHead>Concluído</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Atualizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.filter(a => a.isCompleted === showCompleted).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhum alerta encontrado
                  </TableCell>
                </TableRow>
              ) : (
                alerts.filter(a => a.isCompleted === showCompleted).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{alert.vehicleId}</TableCell>
                    <TableCell>{alert.description}</TableCell>
                    <TableCell>{alert.doneDate ? new Date(alert.doneDate).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>{alert.kmAlert}</TableCell>
                    <TableCell>{alert.isCompleted ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{new Date(alert.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(alert.updatedAt).toLocaleDateString('pt-BR')}</TableCell>
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
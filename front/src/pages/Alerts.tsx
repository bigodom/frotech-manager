import { useState } from "react"
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

interface Alert {
  id: string
  type: string
  priority: string
  status: string
  vehicleId: string
  description: string
  createdAt: string
  dueDate: string
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    priority: "medium",
    status: "pending",
    vehicleId: "",
    description: "",
    dueDate: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setAlerts([...alerts, newAlert])
    setFormData({
      type: "",
      priority: "medium",
      status: "pending",
      vehicleId: "",
      description: "",
      dueDate: ""
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alertas</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Alerta
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Alerta</CardTitle>
            <CardDescription>
              Preencha os dados para criar um novo alerta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Alerta</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
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
                    value={formData.vehicleId}
                    onChange={handleChange}
                    placeholder="Ex: ABC-1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data Limite</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
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
          </CardContent>
        </Card>
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
                <TableHead>Prioridade</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Data Limite</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum alerta cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      {alert.type === "maintenance" && "Manutenção"}
                      {alert.type === "inspection" && "Inspeção"}
                      {alert.type === "document" && "Documentação"}
                      {alert.type === "tire" && "Pneu"}
                      {alert.type === "fuel" && "Combustível"}
                      {alert.type === "other" && "Outro"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${alert.priority === "low" && "bg-green-100 text-green-800"}
                        ${alert.priority === "medium" && "bg-yellow-100 text-yellow-800"}
                        ${alert.priority === "high" && "bg-orange-100 text-orange-800"}
                        ${alert.priority === "urgent" && "bg-red-100 text-red-800"}
                      `}>
                        {alert.priority === "low" && "Baixa"}
                        {alert.priority === "medium" && "Média"}
                        {alert.priority === "high" && "Alta"}
                        {alert.priority === "urgent" && "Urgente"}
                      </span>
                    </TableCell>
                    <TableCell>{alert.vehicleId}</TableCell>
                    <TableCell>{alert.description}</TableCell>
                    <TableCell>{alert.createdAt}</TableCell>
                    <TableCell>{alert.dueDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${alert.status === "pending" && "bg-yellow-100 text-yellow-800"}
                        ${alert.status === "in_progress" && "bg-blue-100 text-blue-800"}
                        ${alert.status === "resolved" && "bg-green-100 text-green-800"}
                        ${alert.status === "cancelled" && "bg-gray-100 text-gray-800"}
                      `}>
                        {alert.status === "pending" && "Pendente"}
                        {alert.status === "in_progress" && "Em Andamento"}
                        {alert.status === "resolved" && "Resolvido"}
                        {alert.status === "cancelled" && "Cancelado"}
                      </span>
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
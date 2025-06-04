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

interface Tire {
  id: string
  brand: string
  model: string
  size: string
  dot: string
  position: string
  vehicleId: string
  status: string
  treadDepth: number
  purchaseDate: string
}

export default function Tires() {
  const [tires, setTires] = useState<Tire[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    size: "",
    dot: "",
    position: "",
    vehicleId: "",
    status: "new",
    treadDepth: "",
    purchaseDate: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTire: Tire = {
      id: crypto.randomUUID(),
      ...formData,
      treadDepth: parseFloat(formData.treadDepth)
    }
    setTires([...tires, newTire])
    setFormData({
      brand: "",
      model: "",
      size: "",
      dot: "",
      position: "",
      vehicleId: "",
      status: "new",
      treadDepth: "",
      purchaseDate: ""
    })
    setIsFormOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <h1 className="text-3xl font-bold">Pneus</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pneu
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Pneu</CardTitle>
            <CardDescription>
              Preencha os dados do pneu para cadastrá-lo na frota.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Ex: Michelin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Ex: XPS Traction"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Dimensão</Label>
                  <Input
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="Ex: 205/55R16"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dot">DOT</Label>
                  <Input
                    id="dot"
                    name="dot"
                    value={formData.dot}
                    onChange={handleChange}
                    placeholder="Ex: 4T1X"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Posição</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleSelectChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front_left">Dianteira Esquerda</SelectItem>
                      <SelectItem value="front_right">Dianteira Direita</SelectItem>
                      <SelectItem value="rear_left">Traseira Esquerda</SelectItem>
                      <SelectItem value="rear_right">Traseira Direita</SelectItem>
                      <SelectItem value="spare">Estepe</SelectItem>
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
                  <Label htmlFor="treadDepth">Profundidade da Banda (mm)</Label>
                  <Input
                    id="treadDepth"
                    name="treadDepth"
                    type="number"
                    step="0.1"
                    value={formData.treadDepth}
                    onChange={handleChange}
                    placeholder="Ex: 7.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Data de Compra</Label>
                  <Input
                    id="purchaseDate"
                    name="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleChange}
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
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="in_use">Em Uso</SelectItem>
                      <SelectItem value="worn">Desgastado</SelectItem>
                      <SelectItem value="damaged">Danificado</SelectItem>
                      <SelectItem value="scrapped">Inutilizado</SelectItem>
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
          <CardTitle>Pneus Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os pneus cadastrados na frota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Dimensão</TableHead>
                <TableHead>DOT</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Banda (mm)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhum pneu cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                tires.map((tire) => (
                  <TableRow key={tire.id}>
                    <TableCell>{tire.brand}</TableCell>
                    <TableCell>{tire.model}</TableCell>
                    <TableCell>{tire.size}</TableCell>
                    <TableCell>{tire.dot}</TableCell>
                    <TableCell>
                      {tire.position === "front_left" && "Dianteira Esquerda"}
                      {tire.position === "front_right" && "Dianteira Direita"}
                      {tire.position === "rear_left" && "Traseira Esquerda"}
                      {tire.position === "rear_right" && "Traseira Direita"}
                      {tire.position === "spare" && "Estepe"}
                    </TableCell>
                    <TableCell>{tire.vehicleId}</TableCell>
                    <TableCell>{tire.treadDepth}</TableCell>
                    <TableCell>
                      {tire.status === "new" && "Novo"}
                      {tire.status === "in_use" && "Em Uso"}
                      {tire.status === "worn" && "Desgastado"}
                      {tire.status === "damaged" && "Danificado"}
                      {tire.status === "scrapped" && "Inutilizado"}
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
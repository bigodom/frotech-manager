import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { Tire, CreateTireDTO } from "@/lib/types/Tire"
import api from "@/services/useApi"

export default function Tires() {
  const [tires, setTires] = useState<Tire[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<CreateTireDTO>({
    fireId: 0,
    retreadNumber: 0,
    grooveDepth: 0,
    purchaseDate: new Date(),
    brand: "",
    model: "",
    measure: "",
    value: 0,
    currentKm: 0
  })
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTireData, setEditTireData] = useState<Tire | null>(null)

  const handleNeuTire = async (data: CreateTireDTO) => {
    try {
      const response = await api.post('/tire', data)
      setTires(prev => [...prev, response.data])
      setIsFormOpen(false)
      setFormData({
        fireId: 0,
        retreadNumber: 0,
        grooveDepth: 0,
        purchaseDate: new Date(),
        brand: "",
        model: "",
        measure: "",
        value: 0,
        currentKm: 0
      })
    }
    catch (error) {
      console.error('Erro ao cadastrar pneu:', error)
      alert('Erro ao cadastrar pneu. Tente novamente mais tarde.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }))
  }

  const fetchTires = async () => {
    try {
      const response = await api.get('/tire')
      setTires(response.data)
    } catch (error) {
      console.error('Erro ao buscar pneus:', error)
      alert('Erro ao carregar pneus. Tente novamente mais tarde.')
    }
  }

  useEffect(() => {
    fetchTires()
  }, [])

  // Não há selects customizados neste cadastro


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pneus</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pneu
        </Button>
      </div>

      {/* Modal de cadastro */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Pneu</DialogTitle>
            <CardDescription>
              Preencha os dados do pneu para cadastrá-lo na frota.
            </CardDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleNeuTire(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* ...campos do formulário, igual já está... */}
              <div className="space-y-2">
                <Label htmlFor="fireId">ID de Fogo *</Label>
                <Input id="fireId" name="fireId" type="number" value={formData.fireId} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retreadNumber">Nº de Recapagens</Label>
                <Input id="retreadNumber" name="retreadNumber" type="number" value={formData.retreadNumber} onChange={handleChange} min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grooveDepth">Sulco (mm)</Label>
                <Input id="grooveDepth" name="grooveDepth" type="number" step="0.1" value={formData.grooveDepth} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input id="purchaseDate" name="purchaseDate" type="date" value={typeof formData.purchaseDate === 'string' ? formData.purchaseDate : formData.purchaseDate.toISOString().split('T')[0]} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" value={formData.model} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="measure">Medida</Label>
                <Input id="measure" name="measure" value={formData.measure} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input id="value" name="value" type="number" step="0.01" value={formData.value} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentKm">KM Atual</Label>
                <Input id="currentKm" name="currentKm" type="number" value={formData.currentKm} onChange={handleChange} />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização/edição */}
      <Dialog open={isViewOpen} onOpenChange={(open) => {
        setIsViewOpen(open);
        if (!open) {
          setIsEditMode(false);
          setSelectedTire(null);
          setEditTireData(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pneu</DialogTitle>
          </DialogHeader>
          {selectedTire && !isEditMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>ID de Fogo</Label><p>{selectedTire.fireId}</p></div>
                <div><Label>Marca</Label><p>{selectedTire.brand}</p></div>
                <div><Label>Modelo</Label><p>{selectedTire.model}</p></div>
                <div><Label>Medida</Label><p>{selectedTire.measure}</p></div>
                <div><Label>Recapagens</Label><p>{selectedTire.retreadNumber}</p></div>
                <div><Label>Sulco (mm)</Label><p>{selectedTire.grooveDepth}</p></div>
                <div><Label>Valor (R$)</Label><p>{selectedTire.value}</p></div>
                <div><Label>KM Atual</Label><p>{selectedTire.currentKm}</p></div>
                <div><Label>Data Compra</Label><p>{selectedTire.purchaseDate instanceof Date ? selectedTire.purchaseDate.toLocaleDateString() : new Date(selectedTire.purchaseDate).toLocaleDateString()}</p></div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => {
                  setIsEditMode(true);
                  setEditTireData(selectedTire);
                }}>Editar</Button>
                <Button type="button" variant="outline" onClick={() => setIsViewOpen(false)}>Fechar</Button>
              </div>
            </div>
          ) : selectedTire && isEditMode && editTireData ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Aqui você pode fazer o update na API se desejar
                setTires(prev => prev.map(t => t.id === editTireData.id ? editTireData : t));
                setIsEditMode(false);
                setIsViewOpen(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fireId">ID de Fogo *</Label>
                  <Input id="edit-fireId" name="fireId" type="number" value={editTireData.fireId} onChange={e => setEditTireData(prev => prev ? { ...prev, fireId: Number(e.target.value) } : null)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-retreadNumber">Nº de Recapagens</Label>
                  <Input id="edit-retreadNumber" name="retreadNumber" type="number" value={editTireData.retreadNumber} onChange={e => setEditTireData(prev => prev ? { ...prev, retreadNumber: Number(e.target.value) } : null)} min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-grooveDepth">Sulco (mm)</Label>
                  <Input id="edit-grooveDepth" name="grooveDepth" type="number" step="0.1" value={editTireData.grooveDepth} onChange={e => setEditTireData(prev => prev ? { ...prev, grooveDepth: Number(e.target.value) } : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseDate">Data de Compra</Label>
                  <Input id="edit-purchaseDate" name="purchaseDate" type="date" value={typeof editTireData.purchaseDate === 'string' ? editTireData.purchaseDate : editTireData.purchaseDate.toISOString().split('T')[0]} onChange={e => setEditTireData(prev => prev ? { ...prev, purchaseDate: e.target.value } : null)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Marca *</Label>
                  <Input id="edit-brand" name="brand" value={editTireData.brand} onChange={e => setEditTireData(prev => prev ? { ...prev, brand: e.target.value } : null)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Modelo</Label>
                  <Input id="edit-model" name="model" value={editTireData.model} onChange={e => setEditTireData(prev => prev ? { ...prev, model: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-measure">Medida</Label>
                  <Input id="edit-measure" name="measure" value={editTireData.measure} onChange={e => setEditTireData(prev => prev ? { ...prev, measure: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Valor (R$)</Label>
                  <Input id="edit-value" name="value" type="number" step="0.01" value={editTireData.value} onChange={e => setEditTireData(prev => prev ? { ...prev, value: Number(e.target.value) } : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currentKm">KM Atual</Label>
                  <Input id="edit-currentKm" name="currentKm" type="number" value={editTireData.currentKm} onChange={e => setEditTireData(prev => prev ? { ...prev, currentKm: Number(e.target.value) } : null)} />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

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
                <TableHead>ID Fogo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead>Recapagens</TableHead>
                <TableHead>Sulco (mm)</TableHead>
                <TableHead>Valor (R$)</TableHead>
                <TableHead>KM Atual</TableHead>
                <TableHead>Data Compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Nenhum pneu cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                tires.map((tire) => (
                  <TableRow key={tire.id} className="cursor-pointer hover:bg-gray-100" onClick={() => { setSelectedTire(tire); setIsViewOpen(true); }}>
                    <TableCell>{tire.fireId}</TableCell>
                    <TableCell>{tire.brand}</TableCell>
                    <TableCell>{tire.model}</TableCell>
                    <TableCell>{tire.measure}</TableCell>
                    <TableCell>{tire.retreadNumber}</TableCell>
                    <TableCell>{tire.grooveDepth}</TableCell>
                    <TableCell>{tire.value}</TableCell>
                    <TableCell>{tire.currentKm}</TableCell>
                    <TableCell>{tire.purchaseDate instanceof Date ? tire.purchaseDate.toLocaleDateString() : new Date(tire.purchaseDate).toLocaleDateString()}</TableCell>
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
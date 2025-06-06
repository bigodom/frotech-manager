import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { CreateDriverDTO, Driver } from "@/lib/types/Driver"
import api from "@/services/useApi"
import { dateToISO } from "@/lib/utils"

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleNewDriver = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const newDriver: CreateDriverDTO = {
      name: formData.get("name") as string,
      cpf: formData.get("cpf") as string,
      cnh: formData.get("cnh") as string,
      cnhCategory: formData.get("cnhType") as string,
      cnhExpiration: new Date(formData.get("cnhExpiration") as string),
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      position: formData.get("position") as string,
    }

    api.post("/driver", newDriver)
      .then(() => {
        fetchDrivers()
        setIsFormOpen(false)
      })
      .catch((error) => {
        console.error("Erro ao cadastrar motorista:", error.response?.data || error)
      })
  }

  const handleEditDriver = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDriver) return

    try {
      await api.put(`/driver/${selectedDriver.id}`, selectedDriver)
      await fetchDrivers()
      setIsEditOpen(false)
      setSelectedDriver(null)
    } catch (error) {
      console.error("Erro ao atualizar motorista:", error)
    }
  }

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return

    if (window.confirm(`Tem certeza que deseja excluir o motorista ${selectedDriver.name}?`)) {
      try {
        await api.delete(`/driver/${selectedDriver.id}`)
        await fetchDrivers()
        setIsEditOpen(false)
        setSelectedDriver(null)
      } catch (error) {
        console.error("Erro ao excluir motorista:", error)
      }
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/driver")
      const sortedDrivers = response.data.sort((a: Driver, b: Driver) => 
        a.name.localeCompare(b.name)
      )
      setDrivers(sortedDrivers)
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error)
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    searchTerm === "" || 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Motoristas</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Motorista
        </Button>
      </div>

      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Motorista</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" name="cpf" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnh">CNH</Label>
                  <Input id="cnh" name="cnh" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnhType">Categoria CNH</Label>
                  <Select name="cnhType">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnhExpiration">Validade CNH</Label>
                  <Input
                    type="date"
                    id="cnhExpiration"
                    name="cnhExpiration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" name="address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Posição</Label>
                  <Input id="position" name="position" />
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
          <CardTitle>Motoristas Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os motoristas cadastrados na frota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filtrar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNH</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Posição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Nenhum motorista encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedDriver(driver)
                              setIsEditOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {driver.name}
                          </button>
                        </TableCell>
                        <TableCell>{driver.cnh || '-'}</TableCell>
                        <TableCell>{driver.cnhCategory || '-'}</TableCell>
                        <TableCell>{driver.phone || '-'}</TableCell>
                        <TableCell>{driver.position || '-'}</TableCell>
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
          setSelectedDriver(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Motorista</DialogTitle>
          </DialogHeader>
          {isEditMode ? (
            <form onSubmit={handleEditDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo *</Label>
                  <Input
                    id="edit-name"
                    value={selectedDriver?.name || ''}
                    onChange={(e) => setSelectedDriver(prev => prev ? {...prev, name: e.target.value} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF *</Label>
                  <Input
                    id="edit-cpf"
                    value={selectedDriver?.cpf || ''}
                    onChange={(e) => setSelectedDriver(prev => prev ? {...prev, cpf: e.target.value} : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cnh">CNH</Label>
                  <Input
                    id="edit-cnh"
                    value={selectedDriver?.cnh || ''}
                    onChange={(e) => setSelectedDriver(prev => prev ? {...prev, cnh: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cnhCategory">Categoria CNH</Label>
                  <Select
                    value={selectedDriver?.cnhCategory || ''}
                    onValueChange={(value) => setSelectedDriver(prev => prev ? {...prev, cnhCategory: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AD">AD</SelectItem>
                      <SelectItem value="AE">AE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedDriver?.phone || ''}
                    onChange={(e) => setSelectedDriver(prev => prev ? {...prev, phone: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Posição</Label>
                  <Input
                    id="edit-position"
                    value={selectedDriver?.position || ''}
                    onChange={(e) => setSelectedDriver(prev => prev ? {...prev, position: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    value={selectedDriver?.address || ''}
                    onChange={(e) => setSelectedDriver(prev => prev ? {...prev, address: e.target.value} : null)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteDriver}
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
                  <Label>Nome Completo</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.name}</p>
                </div>
                <div>
                  <Label>CPF</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.cpf}</p>
                </div>
                <div>
                  <Label>CNH</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.cnh || '-'}</p>
                </div>
                <div>
                  <Label>Categoria CNH</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.cnhCategory || '-'}</p>
                </div>
                <div>
                  <Label>Telefone</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.phone || '-'}</p>
                </div>
                <div>
                  <Label>Posição</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.position || '-'}</p>
                </div>
                <div>
                  <Label>Endereço</Label>
                  <p className="text-sm text-gray-600">{selectedDriver?.address || '-'}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteDriver}
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
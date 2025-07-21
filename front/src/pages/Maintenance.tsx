
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Maintenance, CreateMaintenanceDTO } from "@/lib/types/Maintenance"
import { fetchMaintenances, createMaintenance, createMaintenanceWithReview, updateMaintenance, deleteMaintenance } from "./Maintenance/maintenanceService"
import { MaintenanceForm } from "./Maintenance/MaintenanceForm"
import { MaintenanceDetails } from "./Maintenance/MaintenanceDetails"
import { MaintenanceTable } from "./Maintenance/MaintenanceTable"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchPlate, setSearchPlate] = useState("")
  const [searchInvoiceId, setSearchInvoiceId] = useState("")
  const [searchDescription, setSearchDescription] = useState("")
  const [persistFields, setPersistFields] = useState(false)
  const [initialData, setInitialData] = useState<Partial<CreateMaintenanceDTO>>({})

  useEffect(() => {
    loadMaintenances()
    console.log("Maintenances loaded")
  }, [])

  const loadMaintenances = async () => {
    try {
      const data = await fetchMaintenances()
      setMaintenances(data)
    } catch (error) {
      console.error("Erro ao buscar manutenções:", error)
    }
  }


  const handleNewMaintenance = async (
    data: CreateMaintenanceDTO & { review?: { type: string, currentKm: number, nextReviewKm: number } }
  ) => {
    try {
      if (data.review) {
        await createMaintenanceWithReview(data, data.review)
      } else {
        await createMaintenance(data)
      }

      await loadMaintenances()

      toast.success("Manutenção cadastrada com sucesso!")

      if (!persistFields) {
        setInitialData({})
      } else {
        setInitialData({
          plate: data.plate,
          issuer: data.issuer,
          invoiceId: data.invoiceId,
          invoiceDate: data.invoiceDate,
          date: data.date
        })
      }
    } catch (error) {
      console.error("Erro ao cadastrar manutenção:", error)
      toast.warning("Erro ao cadastrar manutenção!")
    }
  }


  const handleEditClick = () => setIsEditMode(true)
  const handleCancelEdit = () => setIsEditMode(false)


  const handleEditMaintenance = async (data: Maintenance) => {
    if (!selectedMaintenance) return
    try {
      await updateMaintenance(selectedMaintenance.id, data)
      await loadMaintenances()
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
        await deleteMaintenance(selectedMaintenance.id)
        await loadMaintenances()
        setIsEditOpen(false)
        setSelectedMaintenance(null)
        setIsEditMode(false)
      } catch (error) {
        console.error("Erro ao excluir manutenção:", error)
      }
    }
  }

  // Paginação e filtro
  const filteredMaintenances = maintenances.filter(m => {
    const plateMatch = searchPlate === "" || m.plate.toLowerCase().includes(searchPlate.toLowerCase())
    const invoiceMatch = searchInvoiceId === "" || String(m.invoiceId).includes(searchInvoiceId)
    const descriptionMatch = searchDescription === "" || m.description.toLowerCase().includes(searchDescription.toLowerCase())
    return plateMatch && invoiceMatch && descriptionMatch
  })
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
            <MaintenanceForm key={JSON.stringify(initialData)} onSubmit={handleNewMaintenance} onCancel={() => {
              setIsFormOpen(false)
              setInitialData({})
            }} initialData={initialData}
              persistFields={persistFields} setPersistFields={setPersistFields} />
          </DialogContent>
        </Dialog>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Histórico de Manutenções</CardTitle>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Filtrar por placa..."
              value={searchPlate}
              onChange={e => {
                setSearchPlate(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-xs"
            />
            <Input
              placeholder="Filtrar por número da nota..."
              value={searchInvoiceId}
              onChange={e => {
                setSearchInvoiceId(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-xs"
              type="number"
            />
            <Input
              placeholder="Filtrar por descrição..."
              value={searchDescription}
              onChange={e => {
                setSearchDescription(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[calc(100vh-300px)] overflow-auto">
            <MaintenanceTable maintenances={paginatedMaintenances} onSelect={m => { setSelectedMaintenance(m); setIsEditOpen(true) }} />
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
          {isEditMode && selectedMaintenance ? (
            <MaintenanceForm
              initialData={selectedMaintenance}
              onSubmit={data => handleEditMaintenance({ ...selectedMaintenance, ...data })}
              onCancel={handleCancelEdit}
              submitLabel="Salvar"
            />
          ) : selectedMaintenance ? (
            <MaintenanceDetails
              maintenance={selectedMaintenance}
              onEdit={handleEditClick}
              onDelete={handleDeleteMaintenance}
              onClose={() => setIsEditOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

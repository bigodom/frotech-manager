import type { Maintenance, CreateMaintenanceDTO } from "@/lib/types/Maintenance"
import api from "@/services/useApi"

export const fetchMaintenances = async (): Promise<Maintenance[]> => {
  const response = await api.get("/maintenance")
  // Ordena por data decrescente
  return response.data.sort((a: Maintenance, b: Maintenance) => new Date(b.date).getTime() - new Date(a.date).getTime())
}


export const createMaintenanceWithReview = async (maintenance: CreateMaintenanceDTO, review?: { type: string, currentKm: number, nextReviewKm: number }) => {
  // Cria manutenção normalmente
  const res = await api.post("/maintenance", maintenance)
  if (review && res.data && res.data.id) {
    // Cria revisão vinculada à manutenção
    await api.post("/review", {
      maintenanceId: res.data.id,
      ...review
    })
  }
}

export const createMaintenance = async (newMaintenance: CreateMaintenanceDTO) => {
  await api.post("/maintenance", newMaintenance)
}

export const updateMaintenance = async (id: number, maintenance: Maintenance) => {
  await api.put(`/maintenance/${id}`, maintenance)
}

export const deleteMaintenance = async (id: number) => {
  await api.delete(`/maintenance/${id}`)
}



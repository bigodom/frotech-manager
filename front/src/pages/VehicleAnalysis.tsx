import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Maintenance } from "@/lib/types/Maintenance"
import type { Fuel } from "@/lib/types/Fuel"
import api from "@/services/useApi"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"

const PAGE_SIZE = 5

export default function VehicleAnalysis() {
  const { plate } = useParams<{ plate: string }>()
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [fuels, setFuels] = useState<Fuel[]>([])
  const [maintenancePage, setMaintenancePage] = useState(1)
  const [fuelPage, setFuelPage] = useState(1)

  useEffect(() => {
    if (!plate) return
    api.get(`/maintenance/plate/${plate}`).then(res => setMaintenances(res.data))
    api.get(`/fuel/plate/${plate}`).then(res => setFuels(res.data))
  }, [plate])

  // Paginação
  const totalMaintenancePages = Math.ceil(maintenances.length / PAGE_SIZE)
  const totalFuelPages = Math.ceil(fuels.length / PAGE_SIZE)
  const paginatedMaintenances = maintenances.slice((maintenancePage - 1) * PAGE_SIZE, maintenancePage * PAGE_SIZE)
  const paginatedFuels = fuels.slice((fuelPage - 1) * PAGE_SIZE, fuelPage * PAGE_SIZE)

  // Agrupamento por mês para gráficos
  function groupByMonth(data: { date: string | Date, totalCost: number }[]) {
    const result: Record<string, number> = {}
    data.forEach(item => {
      const d = new Date(item.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      result[key] = (result[key] || 0) + (item.totalCost || 0)
    })
    return Object.entries(result).map(([month, value]) => ({ month, value }))
  }
  const maintenanceChartData = groupByMonth(maintenances)
  const fuelChartData = groupByMonth(fuels)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Análise do Veículo: {plate}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Manutenções</CardTitle>
            <CardDescription>Últimas manutenções do veículo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Custo Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Nenhuma manutenção encontrada</TableCell>
                  </TableRow>
                ) : (
                  paginatedMaintenances.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                      <TableCell>{m.description}</TableCell>
                      <TableCell>{m.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setMaintenancePage(p => Math.max(1, p - 1))} disabled={maintenancePage === 1}>Anterior</Button>
              <span className="self-center">Página {maintenancePage} de {totalMaintenancePages}</span>
              <Button variant="outline" size="sm" onClick={() => setMaintenancePage(p => Math.min(totalMaintenancePages, p + 1))} disabled={maintenancePage === totalMaintenancePages}>Próxima</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Abastecimentos</CardTitle>
            <CardDescription>Últimos abastecimentos do veículo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Custo Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFuels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Nenhum abastecimento encontrado</TableCell>
                  </TableRow>
                ) : (
                  paginatedFuels.map(f => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                      <TableCell>{f.fuelType}</TableCell>
                      <TableCell>{f.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setFuelPage(p => Math.max(1, p - 1))} disabled={fuelPage === 1}>Anterior</Button>
              <span className="self-center">Página {fuelPage} de {totalFuelPages}</span>
              <Button variant="outline" size="sm" onClick={() => setFuelPage(p => Math.min(totalFuelPages, p + 1))} disabled={fuelPage === totalFuelPages}>Próxima</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Soma de Manutenção por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="value" name="Total Manutenção" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Soma de Combustível por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="value" name="Total Combustível" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
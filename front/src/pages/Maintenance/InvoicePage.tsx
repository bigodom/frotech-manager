import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import api from "@/services/useApi"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function InvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const [maintenances, setMaintenances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoiceMaintenances() {
      setLoading(true)
      try {
        const res = await api.get(`/maintenance/invoice/${invoiceId}`)
        setMaintenances(Array.isArray(res.data) ? res.data : [res.data])
      } catch {
        setMaintenances([])
      } finally {
        setLoading(false)
      }
    }
    fetchInvoiceMaintenances()
  }, [invoiceId])


  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold"></h1>
            <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nota Fiscal Nº {invoiceId}</h1>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero da nota</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Valor Unitário</TableHead>
              <TableHead>Custo Total (R$)</TableHead>
              <TableHead>Emissor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : maintenances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Nenhum dado encontrado</TableCell>
              </TableRow>
            ) : (
              maintenances.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.invoiceId}</TableCell>
                  <TableCell>{item.plate}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.value?.toLocaleString ? item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : item.value}</TableCell>
                  <TableCell>{item.totalCost?.toLocaleString ? item.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : item.totalCost}</TableCell>
                  <TableCell>{item.issuer}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

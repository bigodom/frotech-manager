
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import type { Maintenance } from "@/lib/types/Maintenance"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface MaintenanceTableProps {
  maintenances: Maintenance[]
  onSelect: (maintenance: Maintenance) => void
}

export function MaintenanceTable({ maintenances, onSelect }: MaintenanceTableProps) {
  const navigate = useNavigate()
  const handleInvoiceClick = (invoiceId: number) => {
    navigate(`/maintenance/invoice/${invoiceId}`)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numero da nota</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Custo Total (R$)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maintenances.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Nenhuma manutenção encontrada
              </TableCell>
            </TableRow>
          ) : (
            maintenances.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <button
                    onClick={() => handleInvoiceClick(m.invoiceId)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {m.invoiceId}
                  </button>
                </TableCell>
                <TableCell>{m.plate}</TableCell>
                <TableCell>
                  <button
                    onClick={() => onSelect(m)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {m.description}
                  </button>
                </TableCell>
                <TableCell>{formatDate(m.date)}</TableCell>
                <TableCell>{m.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Navegação para página de nota fiscal */}
    </>
  )
}

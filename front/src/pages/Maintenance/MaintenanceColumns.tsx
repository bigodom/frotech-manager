import type { Maintenance } from "@/lib/types/Maintenance";
import type { ColumnDef } from "@tanstack/react-table";

export const maintenanceColumns: ColumnDef<Maintenance>[] = [
    {
        accessorKey: "invoiceId",
        header: "Numero da nota",
    },
    {
        accessorKey: "plate",
        header: "Placa",
    },
    {
        accessorKey: "description",
        header: "Descrição",
    },
    {
        accessorKey: "date",
        header: "Data",
        cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString("pt-BR"),
    },
    {
        accessorKey: "totalCost",
        header: "Custo Total (R$)",
        cell: ({ row }) => row.getValue("totalCost").toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
]
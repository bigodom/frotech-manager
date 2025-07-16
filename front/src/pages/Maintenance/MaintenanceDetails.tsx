import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Maintenance } from "@/lib/types/Maintenance"
import { formatDate } from "@/lib/utils"


interface MaintenanceDetailsProps {
    maintenance: Maintenance
    onEdit: () => void
    onDelete: () => void
    onClose: () => void
}

export function MaintenanceDetails({ maintenance, onEdit, onDelete, onClose }: MaintenanceDetailsProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Descrição</Label>
                    <p className="text-sm text-gray-600">{maintenance.description}</p>
                </div>
                <div>
                    <Label>Data</Label>
                    <p className="text-sm text-gray-600">{maintenance.date ? formatDate(maintenance.date) : '-'}</p>
                </div>
                <div>
                    <Label>Custo Total</Label>
                    <p className="text-sm text-gray-600">{maintenance.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div>
                    <Label>Placa</Label>
                    <p className="text-sm text-gray-600">{maintenance.plate}</p>
                </div>
                <div>
                    <Label>Nota Fiscal</Label>
                    <p className="text-sm text-gray-600">{maintenance.invoiceId}</p>
                </div>
                <div>
                    <Label>Data da Nota</Label>
                    <p className="text-sm text-gray-600">{maintenance.invoiceDate ? formatDate(maintenance.invoiceDate) : '-'}</p>
                </div>
                <div>
                    <Label>Emissor</Label>
                    <p className="text-sm text-gray-600">{maintenance.issuer}</p>
                </div>
                <div>
                    <Label>Quantidade</Label>
                    <p className="text-sm text-gray-600">{maintenance.quantity}</p>
                </div>
                <div>
                    <Label>Valor Unitário</Label>
                    <p className="text-sm text-gray-600">{maintenance.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                {Array.isArray(maintenance.Review) && maintenance.Review.length > 0 && (
                  <>
                    <div className="col-span-2">
                      <Label>Revisão</Label>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="text-sm text-gray-600">{maintenance.Review[0].type}</p>
                    </div>
                    <div>
                      <Label>KM Atual</Label>
                      <p className="text-sm text-gray-600">{maintenance.Review[0].currentKm}</p>
                    </div>
                    <div>
                      <Label>KM Próxima Revisão</Label>
                      <p className="text-sm text-gray-600">{maintenance.Review[0].nextReviewKm}</p>
                    </div>
                  </>
                )}
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="destructive" onClick={onDelete}>
                    Excluir
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Fechar
                </Button>
                <Button onClick={onEdit}>
                    Editar
                </Button>
            </div>
        </div>
    )
}


import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Maintenance, CreateMaintenanceDTO } from "@/lib/types/Maintenance"
import React from "react"

interface MaintenanceFormProps {
    initialData?: Partial<CreateMaintenanceDTO | Maintenance>
    onSubmit: (data: CreateMaintenanceDTO & { review?: ReviewFormData }) => void
    onCancel: () => void
    submitLabel?: string
}

interface ReviewFormData {
    type: string
    currentKm: number
    nextReviewKm: number
}

export function MaintenanceForm({ initialData = {}, onSubmit, onCancel, submitLabel = "Cadastrar" }: MaintenanceFormProps) {
  const [form, setForm] = React.useState<Partial<CreateMaintenanceDTO>>({
    ...initialData,
    invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate) : undefined,
    date: initialData.date ? new Date(initialData.date) : undefined,
  })

const [hasReview, setHasReview] = React.useState(false)
const [review, setReview] = React.useState<ReviewFormData>({ type: '', currentKm: 0, nextReviewKm: 0 })

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value
    }))
}

const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
        ...prev,
        [name]: value ? new Date(value) : undefined
    }))
}

const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setReview(prev => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value
    }))
}

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hasReview) {
        onSubmit({ ...(form as CreateMaintenanceDTO), review })
    } else {
        onSubmit(form as CreateMaintenanceDTO)
    }
}

return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input id="description" name="description" value={form.description || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" name="date" type="date" value={form.date ? new Date(form.date).toISOString().split('T')[0] : ''} onChange={handleDateChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="totalCost">Custo Total *</Label>
                <Input id="totalCost" name="totalCost" type="number" step="0.01" value={form.totalCost || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="plate">Placa *</Label>
                <Input id="plate" name="plate" value={form.plate || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="invoiceId">Nota Fiscal *</Label>
                <Input id="invoiceId" name="invoiceId" type="number" value={form.invoiceId || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="invoiceDate">Data da Nota *</Label>
                <Input id="invoiceDate" name="invoiceDate" type="date" value={form.invoiceDate ? new Date(form.invoiceDate).toISOString().split('T')[0] : ''} onChange={handleDateChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="issuer">Emissor *</Label>
                <Input id="issuer" name="issuer" value={form.issuer || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input id="quantity" name="quantity" type="number" step="0.01" value={form.quantity || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="value">Valor Unitário *</Label>
                <Input id="value" name="value" type="number" step="0.01" value={form.value || ''} onChange={handleChange} required />
            </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
            <Checkbox id="hasReview" checked={hasReview} onCheckedChange={checked => setHasReview(!!checked)} />
            <Label htmlFor="hasReview">Cadastrar revisão junto</Label>
        </div>
        {hasReview && (
            <div className="grid grid-cols-3 gap-4 border p-4 rounded-md bg-gray-50">
                <div className="space-y-2">
                    <Label htmlFor="review-type">Tipo *</Label>
                    <Input id="review-type" name="type" value={review.type} onChange={handleReviewChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="review-currentKm">KM Atual</Label>
                    <Input id="review-currentKm" name="currentKm" type="number" value={review.currentKm} onChange={handleReviewChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="review-nextReviewKm">KM Próxima Revisão</Label>
                    <Input id="review-nextReviewKm" name="nextReviewKm" type="number" value={review.nextReviewKm} onChange={handleReviewChange} required />
                </div>
            </div>
        )}
        <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit">{submitLabel}</Button>
        </div>
    </form>
)
}
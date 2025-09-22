
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Maintenance, CreateMaintenanceDTO } from "@/lib/types/Maintenance"
import React, { useEffect } from "react"
import { fetchIssuers, fetchPlates } from "./maintenanceService"

interface MaintenanceFormProps {
    initialData?: Partial<CreateMaintenanceDTO | Maintenance>
    onSubmit: (data: CreateMaintenanceDTO & { review?: ReviewFormData }) => void
    onCancel: () => void
    submitLabel?: string
    persistFields?: boolean
    setPersistFields?: (value: boolean) => void
}

interface ReviewFormData {
    type: string
    currentKm: number
    nextReviewKm: number
}

export function MaintenanceForm({ initialData = {}, onSubmit, onCancel, submitLabel = "Cadastrar", persistFields, setPersistFields }: MaintenanceFormProps) {
    const [form, setForm] = React.useState<Partial<CreateMaintenanceDTO>>({
        ...initialData,
        invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate) : undefined,
        date: initialData.date ? new Date(initialData.date) : undefined,
    })

    const [hasReview, setHasReview] = React.useState(false)
    const [review, setReview] = React.useState<ReviewFormData>({ type: '', currentKm: 0, nextReviewKm: 0 })
    const maisUm = persistFields ?? false
    const setMaisUm = setPersistFields ?? (() => { })


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        let typedValue
        if (type === "number") {
            // Substitui vírgula por ponto antes de converter
            typedValue = Number(value.replace(",", "."))
        } else {
            typedValue = value.toUpperCase()
        }

        setForm(prev => {
            const updated = {
                ...prev,
                [name]: typedValue
            }

            // Atualiza totalCost se quantity e value forem válidos
            const quantity = name === "quantity" ? typedValue : prev.quantity
            const unitValue = name === "value" ? typedValue : prev.value

            if (typeof quantity === "number" && typeof unitValue === "number") {
                updated.totalCost = parseFloat((quantity * unitValue).toFixed(2))
            }

            return updated
        })
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
            [name]: type === "number" ? Number(value) : value.toUpperCase()
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // 1) dispara o onSubmit normalmente
        if (hasReview) {
            onSubmit({ ...(form as CreateMaintenanceDTO), review })
        } else {
            onSubmit(form as CreateMaintenanceDTO)
        }

        // 2) monta o objeto com os campos que devem persistir
        const persistidos = {
            issuer: form.issuer,
            date: form.date,
            invoiceDate: form.invoiceDate,
            invoiceId: form.invoiceId,
            plate: form.plate
        }

        if (maisUm) {
            // 3a) reinicializa o form usando esses valores
            setForm({
                ...persistidos,
                description: '',        // limpa o que não deve persistir
                quantity: 1, // ou 1 se preferir um default
                value: 0, // ou 0
                totalCost: 0, // ou 0
            })
            // (se tiver review, também limpe o estado de review aqui)
        } else {
            // 3b) limpa tudo
            setForm({})
            setReview({ type: '', currentKm: 0, nextReviewKm: 0 })
            setHasReview(false)
        }
    }

    const [issuers, setIssuers] = React.useState<string[]>([])
    const [plates, setPlates] = React.useState<string[]>([])

    useEffect(() => {
        const loadIssuers = async () => {
            try {
                const data: Array<string | { issuer: string }> = await fetchIssuers()

                // Se data for uma lista de objetos, extraia os nomes:
                const names = data.map(item => typeof item === "string" ? item : item.issuer)

                setIssuers(names)
            } catch (error) {
                console.error("Erro ao buscar emissores:", error)
            }
        }

        const loadPlates = async () => {
            const data: Array<string | { plate: string }> = await fetchPlates()
            const names = data.map(item => typeof item === "string" ? item : item.plate)
            setPlates(names)
        }

        loadPlates()
        loadIssuers()
    }, [])

    const handleCancel = () => {
        // limpa estado interno
        setForm({
            invoiceDate: undefined,
            date: undefined,
            issuer: '',
            plate: '',
            invoiceId: undefined,
            description: '',
            quantity: undefined,
            value: undefined,
            totalCost: undefined,
        })
        setReview({ type: '', currentKm: 0, nextReviewKm: 0 })
        setHasReview(false)
        setMaisUm(false)
        // opcional: se o pai estiver controlando persistFields, limpa lá também
        if (setPersistFields) setPersistFields(false)

        // finalmente, fecha o form
        onCancel()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="issuer">Emissor *</Label>
                    <Input id="issuer" name="issuer" className={maisUm ? 'bg-yellow-100' : ''} value={form.issuer || ''} onChange={handleChange} list="issuers-list" required autoComplete="off" />
                    <datalist id="issuers-list">
                        {issuers.map((issuer, i) => (
                            <option key={i} value={issuer} />
                        ))}
                    </datalist>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input id="date" name="date" type="date" className={maisUm ? 'bg-yellow-100' : ''} value={form.date ? new Date(form.date).toISOString().split('T')[0] : ''} onChange={handleDateChange} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="plate">Placa *</Label>
                    <Input id="plate" name="plate" className={maisUm ? 'bg-yellow-100' : ''} value={form.plate || ''} onChange={handleChange} required list="plates-list" autoComplete="off" />
                    <datalist id="plates-list">
                        {plates.map((plate, i) => (
                            <option key={i} value={plate} />
                        ))}
                    </datalist>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoiceId">Nota Fiscal *</Label>
                    <Input id="invoiceId" name="invoiceId" type="number" className={maisUm ? 'bg-yellow-100' : ''} value={form.invoiceId || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Data da Nota *</Label>
                    <Input id="invoiceDate" name="invoiceDate" type="date" className={maisUm ? 'bg-yellow-100' : ''} value={form.invoiceDate ? new Date(form.invoiceDate).toISOString().split('T')[0] : ''} onChange={handleDateChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Input id="description" name="description" value={form.description || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input id="quantity" name="quantity" type="number" step="0.01" value={form.quantity || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Valor Unitário *</Label>
                    <Input id="value" name="value" type="number" step="0.001" value={form.value || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="totalCost">Custo Total *</Label>
                    <Input id="totalCost" name="totalCost" type="number" step="0.01" value={form.totalCost || ''} onChange={handleChange} required />
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
                <label>
                    <input
                        type="checkbox"
                        checked={maisUm}
                        onChange={() => setMaisUm(!maisUm)}
                    />
                    Mais um
                </label>
                <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button type="submit">{submitLabel}</Button>
            </div>

        </form>
    )
}
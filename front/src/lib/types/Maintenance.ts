export type Maintenance = {
    id: number;
    invoiceDate: Date;
    invoiceId: number;
    issuer: string;
    date: Date;
    plate: string;
    description: string;
    quantity: number;
    value: number;
    totalCost: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateMaintenanceDTO = Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMaintenanceDTO = Partial<CreateMaintenanceDTO>; 
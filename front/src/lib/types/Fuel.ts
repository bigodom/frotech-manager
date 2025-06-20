export type Fuel = {
    id: number;
    invoiceId: number;
    issuer: string;
    invoiceDate: Date;
    date: Date;
    plate: string;
    kilometers: number;
    fuelType: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    classification: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateFuelDTO = Omit<Fuel, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFuelDTO = Partial<CreateFuelDTO>; 
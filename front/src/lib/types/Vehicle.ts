export type Vehicle = {
    id: number;
    plate: string;
    model: string;
    type: string;
    manufacturingYear?: number;
    modelYear?: number;
    observation?: string;
    color?: string;
    fuelType?: string;
    mileage?: number;
    utility?: string;
    classification?: number;
    registration: string;
    chassi?: string;
    renavam?: string;
    fleet?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateVehicleDTO = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVehicleDTO = Partial<CreateVehicleDTO>; 

export type showVehicle = {
    plate: string;
    model: string;
    type: string;
    mileage: number;
    classification: number;
}

export const classificationOptions = [
    { value: 1, label: 'CARGA' },
    { value: 2, label: 'TRANSPORTE' },
    { value: 3, label: 'BAÚ' },
    { value: 4, label: 'VENDIDO' },
    { value: 5, label: 'PARTICULAR' },
];
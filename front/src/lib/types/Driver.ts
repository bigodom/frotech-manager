export type Driver = {
    id: number;
    name: string;
    cpf: string;
    cnh?: string;
    cnhCategory?: string;
    cnhExpiration?: Date;
    phone?: string;
    address?: string;
    position?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateDriverDTO = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDriverDTO = Partial<CreateDriverDTO>; 
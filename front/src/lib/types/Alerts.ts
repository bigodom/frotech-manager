export type Alerts = {
    id: number;
    vehicleId: number;
    type: string;
    description?: string;
    value?: number;
    doneDate?: Date;
    kmAlert: number;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateAlertsDTO = Omit<Alerts, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAlertsDTO = Partial<CreateAlertsDTO>;
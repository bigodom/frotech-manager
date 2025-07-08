export type Tire = {
  id: number;
  fireId: number;
  retreadNumber: number;
  grooveDepth: number;
  purchaseDate: Date;
  brand: string;
  model: string;
  measure: string;
  value: number;
  currentKm: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTireDTO = Omit<Tire, 'id' | 'createdAt' | 'updatedAt'>;
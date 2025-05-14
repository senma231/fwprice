
export interface ShipmentDetails {
  origin: string;
  destination: string;
  weight?: number; // in kg
  volume?: number; // in cbm
  type?: "sea" | "air" | "land";
}

export interface Price {
  id: string;
  origin: string;
  destination: string;
  amount: number;
  currency: string;
  validFrom?: Date;
  validTo?: Date;
  type: "public" | "internal"; // Differentiates between public and internal prices
  carrier?: string;
  notes?: string;
}

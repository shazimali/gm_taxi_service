/**
 * lib/repositories/interfaces/IVehicleRepository.ts
 *
 * I — Interface Segregation: vehicle read ops (public fleet page)
 *     and write ops (admin fleet management) are clearly separated.
 */

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  category: string;
  model: string;
  tagline: string | null;
  passengerCapacity: number;
  luggageCapacity: number;
  rateHourly: number | null;
  baseFare: number | null;
  baseMiles: number | null;
  perMileRate: number | null;
  mileBrackets: string | null; // JSON-serialised MileBracket[]
  description: string | null;
  image: string | null;
  features: string | null; // JSON-serialised string[]
  amenities: string | null; // JSON-serialised string[]
  ctaType: string; // "both" | "book" | "quote"
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleData {
  slug: string;
  name: string;
  category?: string;
  model?: string;
  tagline?: string | null;
  passengerCapacity?: number;
  luggageCapacity?: number;
  rateHourly?: number | null;
  baseFare?: number | null;
  baseMiles?: number | null;
  perMileRate?: number | null;
  mileBrackets?: string | null;
  description?: string | null;
  image?: string | null;
  features?: string | null;
  amenities?: string | null;
  ctaType?: string;
  displayOrder?: number;
}

export interface IVehicleRepository {
  /** All vehicles ordered by displayOrder (public fleet page) */
  findAll(): Promise<Vehicle[]>;

  /** Single vehicle by slug (detail page / booking form) */
  findBySlug(slug: string): Promise<Vehicle | null>;

  /** Single vehicle by primary key (admin edit) */
  findById(id: string): Promise<Vehicle | null>;

  /** Create a new vehicle (admin) */
  create(data: CreateVehicleData): Promise<Vehicle>;

  /** Update vehicle fields (admin) */
  update(id: string, data: Partial<CreateVehicleData>): Promise<Vehicle>;

  /** Delete vehicle (admin) */
  delete(id: string): Promise<void>;
}

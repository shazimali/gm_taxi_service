/**
 * lib/repositories/interfaces/IZoneRouteRepository.ts
 *
 * S — Single Responsibility: interface for zone route corridor operations.
 */

export interface ZoneRoute {
  id: string;
  vehicleId: string;
  name: string;
  pickupKeywords: string;
  dropoffKeywords: string;
  flatRate: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateZoneRouteData {
  vehicleId: string;
  name: string;
  pickupKeywords: string;
  dropoffKeywords: string;
  flatRate: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface IZoneRouteRepository {
  findAll(): Promise<ZoneRoute[]>;
  findByVehicleId(vehicleId: string): Promise<ZoneRoute[]>;
  findById(id: string): Promise<ZoneRoute | null>;
  create(data: CreateZoneRouteData): Promise<ZoneRoute>;
  update(id: string, data: Partial<CreateZoneRouteData>): Promise<ZoneRoute>;
  delete(id: string): Promise<void>;
}

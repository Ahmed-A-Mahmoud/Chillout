import { Product } from './product.model';
import { Company } from './company.model';
import { Station } from './station.model';
import { Warehouse } from './warehouse.model';
import { Trip } from './trip.model';

export interface Transfer {
    id: string;
    transferredAmount: number;
    day: number;
    month: number;
    year: number;
    isHidden?: boolean;
    product: Product;
    station: Station;
    company: Company;
    warehouse: Warehouse;
    trip: Trip;
}

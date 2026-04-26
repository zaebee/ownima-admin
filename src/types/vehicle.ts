export interface VehicleOwner {
  id: string;
  full_name: string;
  email: string;
}

export interface VehicleGeneralInfo {
  reg_number: string;
  brand: string;
  model: string;
  vehicle_class: string;
  year?: number;
  vin?: string;
  body_type?: string;
}

export interface VehiclePriceTemplates {
  template_name: string;
  deposit_amount: number;
  minimal_rent_period: number;
}

export interface VehicleSpecificationInfo {
  transmission: string;
  doors: number;
  number_of_seats: number;
  fuel_type: string;
  mileage: number;
  engine_capacity: number;
}

export interface VehicleAdditionalInfo {
  insurance_included: boolean;
  anti_hijack: boolean;
  full_wheel_drive: boolean;
  auto_transmission: boolean;
  bluetooth_audio: boolean;
  cruise_control: boolean;
  airbags: boolean;
  wheelchair_accessible: boolean;
}

export interface VehicleExtraOption {
  id: string;
  name: string;
  price: number;
  is_mandatory: boolean;
  description: string;
}

export interface VehicleRatingStats {
  average_rating: number;
  rating_count: number;
}

export interface VehicleListItem {
  id: string;
  name: string;
  status: number;
  price: number;
  currency: string;
  general_info: VehicleGeneralInfo;
  picture: { cover: string };
  owner: VehicleOwner;
  price_templates: VehiclePriceTemplates;
  created_at: string;
}

export interface VehiclePagination {
  data: VehicleListItem[];
  count: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface VehicleDetail extends Omit<VehicleListItem, 'owner'> {
  owner_id: string;
  owner: VehicleOwner;
  specification_info: VehicleSpecificationInfo;
  additional_info: VehicleAdditionalInfo;
  extra_options_details: VehicleExtraOption[];
  rating_stats: VehicleRatingStats;
}

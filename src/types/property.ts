export type PropertyType = 'land_sale' | 'room_rent' | 'land_rent' | 'commercial_rent' | 'lease';
export type PricePeriod = 'monthly' | 'yearly' | 'total' | 'per_sqft';
export type NearbyCategory =
  | 'school'
  | 'college'
  | 'hospital'
  | 'beach'
  | 'bus_stop'
  | 'train_station'
  | 'airport'
  | 'shopping_mall'
  | 'restaurant'
  | 'park'
  | 'temple'
  | 'bank';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  type: PropertyType;
  price: number;
  price_period: PricePeriod | null;
  area: number | null;
  area_unit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
  available: boolean;
  whatsapp_number: string | null;
  cover_image: string | null;
  amenities: string[] | null;
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  property_images?: PropertyImage[];
  property_nearby_places?: NearbyPlace[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface NearbyPlace {
  id: string;
  property_id: string;
  name: string;
  category: NearbyCategory;
  distance: string;
  created_at: string;
}

export interface Enquiry {
  property_id: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  land_sale: 'Land for Sale',
  room_rent: 'Room for Rent',
  land_rent: 'Land for Rent',
  commercial_rent: 'Commercial Rent',
  lease: 'Lease',
};

export const NEARBY_CATEGORY_ICONS: Record<NearbyCategory, string> = {
  school: '🏫',
  college: '🎓',
  hospital: '🏥',
  beach: '🏖️',
  bus_stop: '🚌',
  train_station: '🚂',
  airport: '✈️',
  shopping_mall: '🛍️',
  restaurant: '🍽️',
  park: '🌳',
  temple: '🛕',
  bank: '🏦',
};

export const NEARBY_CATEGORY_LABELS: Record<NearbyCategory, string> = {
  school: 'School',
  college: 'College',
  hospital: 'Hospital',
  beach: 'Beach',
  bus_stop: 'Bus Stop',
  train_station: 'Train Station',
  airport: 'Airport',
  shopping_mall: 'Shopping Mall',
  restaurant: 'Restaurant',
  park: 'Park',
  temple: 'Temple',
  bank: 'Bank',
};

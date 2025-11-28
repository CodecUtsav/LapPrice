export interface Laptop {
  id: number;
  company: string;
  typeName: string;
  inches: number;
  screenResolution: string;
  cpu: string;
  ram: number; // in GB
  memory: string;
  gpu: string;
  opSys: string;
  weight: number; // in kg
  price: number;
}

export interface AggregatedData {
  label: string;
  value: number;
  count?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PREDICTOR = 'PREDICTOR',
  CHAT = 'CHAT'
}

export interface PredictionResult {
  predictedPrice: number;
  reasoning: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FilterState {
  company: string;
  type: string;
}

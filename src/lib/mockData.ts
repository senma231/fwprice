import type { Price } from '@/types/freight';
import type { User } from '@/types/auth';
import type { Announcement } from '@/types/announcement';

export const mockPrices: Price[] = [
  {
    id: '1',
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, US',
    amount: 1200,
    currency: 'USD',
    validFrom: new Date('2024-08-01'),
    validTo: new Date('2024-08-31'),
    type: 'public',
    carrier: 'Oceanic Express (Sea)',
  },
  {
    id: '2',
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, US',
    amount: 950,
    currency: 'USD',
    validFrom: new Date('2024-08-01'),
    validTo: new Date('2024-08-31'),
    type: 'internal',
    carrier: 'Oceanic Express (Sea)',
  },
  {
    id: '3',
    origin: 'Frankfurt, DE',
    destination: 'New York, US',
    amount: 2500,
    currency: 'EUR',
    validFrom: new Date('2024-09-01'),
    validTo: new Date('2024-09-30'),
    type: 'public',
    carrier: 'Global Air Cargo (Air)',
  },
  {
    id: '4',
    origin: 'Frankfurt, DE',
    destination: 'New York, US',
    amount: 2100,
    currency: 'EUR',
    validFrom: new Date('2024-09-01'),
    validTo: new Date('2024-09-30'),
    type: 'internal',
    carrier: 'Global Air Cargo (Air)',
  },
  {
    id: '5',
    origin: 'Shenzhen, CN',
    destination: 'Rotterdam, NL',
    amount: 1500,
    currency: 'USD',
    type: 'public',
    carrier: 'East-West Logistics (Sea)',
  },
  {
    id: '6',
    origin: 'Shenzhen, CN',
    destination: 'Rotterdam, NL',
    amount: 1250,
    currency: 'USD',
    type: 'internal',
    carrier: 'East-West Logistics (Sea)',
  },
];

export const mockUsers: User[] = [
  { id: '1', email: 'admin@freightwise.com', name: 'Admin Freight', role: 'admin' },
  { id: '2', email: 'agent1@freightwise.com', name: 'Alice Agent', role: 'agent' },
  { id: '3', email: 'agent2@freightwise.com', name: 'Bob Broker', role: 'agent' },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Peak Season Surcharges',
    content: 'Please be aware of new peak season surcharges effective from September 1st for all trans-pacific routes.',
    createdAt: new Date('2024-07-15T10:00:00Z'),
    authorId: '1',
    authorName: 'Admin Freight',
  },
  {
    id: '2',
    title: 'System Maintenance Scheduled',
    content: 'The internal system will undergo scheduled maintenance on August 5th from 02:00 to 04:00 UTC. Access may be intermittent.',
    createdAt: new Date('2024-07-20T14:30:00Z'),
    authorId: '1',
    authorName: 'Admin Freight',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPublicPrices = async (criteria: { origin?: string; destination?: string }): Promise<Price[]> => {
  await delay(700);
  return mockPrices.filter(p => 
    p.type === 'public' &&
    (!criteria.origin || p.origin.toLowerCase().includes(criteria.origin.toLowerCase())) &&
    (!criteria.destination || p.destination.toLowerCase().includes(criteria.destination.toLowerCase()))
  );
};

export const fetchInternalPrices = async (criteria: { origin?: string; destination?: string }): Promise<Price[]> => {
  await delay(700);
  return mockPrices.filter(p => 
    p.type === 'internal' &&
    (!criteria.origin || p.origin.toLowerCase().includes(criteria.origin.toLowerCase())) &&
    (!criteria.destination || p.destination.toLowerCase().includes(criteria.destination.toLowerCase()))
  );
};

export const fetchAllPrices = async (): Promise<Price[]> => {
  await delay(500);
  return mockPrices;
};

export const createPrice = async (priceData: Omit<Price, 'id'>): Promise<Price> => {
  await delay(300);
  const newPrice: Price = { ...priceData, id: String(mockPrices.length + 1) };
  mockPrices.push(newPrice); // Mock: In reality, this would be an API call
  return newPrice;
};

export const updatePrice = async (priceId: string, updates: Partial<Price>): Promise<Price | null> => {
  await delay(300);
  const priceIndex = mockPrices.findIndex(p => p.id === priceId);
  if (priceIndex > -1) {
    mockPrices[priceIndex] = { ...mockPrices[priceIndex], ...updates };
    return mockPrices[priceIndex];
  }
  return null;
};

export const deletePrice = async (priceId: string): Promise<boolean> => {
  await delay(300);
  const priceIndex = mockPrices.findIndex(p => p.id === priceId);
  if (priceIndex > -1) {
    mockPrices.splice(priceIndex, 1);
    return true;
  }
  return false;
};


export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  await delay(400);
  return mockAnnouncements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
  await delay(300);
  const newAnnouncement: Announcement = { 
    ...annData, 
    id: String(mockAnnouncements.length + 1),
    createdAt: new Date()
  };
  mockAnnouncements.unshift(newAnnouncement);
  return newAnnouncement;
};

export const updateAnnouncement = async (annId: string, updates: Partial<Announcement>): Promise<Announcement | null> => {
  await delay(300);
  const annIndex = mockAnnouncements.findIndex(a => a.id === annId);
  if (annIndex > -1) {
    mockAnnouncements[annIndex] = { ...mockAnnouncements[annIndex], ...updates };
    return mockAnnouncements[annIndex];
  }
  return null;
};

export const deleteAnnouncement = async (annId: string): Promise<boolean> => {
  await delay(300);
  const annIndex = mockAnnouncements.findIndex(a => a.id === annId);
  if (annIndex > -1) {
    mockAnnouncements.splice(annIndex, 1);
    return true;
  }
  return false;
};

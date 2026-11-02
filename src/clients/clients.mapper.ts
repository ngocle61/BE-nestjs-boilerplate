import type { Client } from '../generated/prisma/client.js';
import type { ClientResponseDto } from './dto/client-response.dto.js';

export const toClientResponse = (client: Client): ClientResponseDto => ({
  id: client.id,
  name: client.name,
  phone: client.phone,
  email: client.email,
  addressLine: client.addressLine,
  postalCode: client.postalCode,
  city: client.city,
  notes: client.notes,
  createdAt: client.createdAt,
});

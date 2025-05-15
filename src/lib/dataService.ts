
'use server';

import type { Price } from '@/types/freight';
import type { Announcement } from '@/types/announcement';
import type { RfqSubmission } from '@/types/rfq';
import type { RfqInput } from '@/ai/flows/submit-rfq-flow';
import { query, toCamelCase } from './db';
import crypto from 'crypto';

// Price Functions
export const fetchPublicPrices = async (criteria: { origin?: string; destination?: string; weight?: number; freightType?: string }): Promise<Price[]> => {
  let sql = 'SELECT * FROM prices WHERE type = $1';
  const params: any[] = ['public'];
  let paramIndex = 2;

  if (criteria.origin) {
    sql += ` AND origin ILIKE $${paramIndex++}`;
    params.push(`%${criteria.origin}%`);
  }
  if (criteria.destination) {
    sql += ` AND destination ILIKE $${paramIndex++}`;
    params.push(`%${criteria.destination}%`);
  }
  // Add more criteria for weight and freightType if needed in schema/query
  sql += ' ORDER BY amount ASC';

  try {
    const { rows } = await query(sql, params);
    return rows.map(row => toCamelCase<Price>(row));
  } catch (error) {
    console.error('Error fetching public prices:', error);
    return [];
  }
};

export const fetchInternalPrices = async (criteria: { origin?: string; destination?: string; weight?: number; freightType?: string }): Promise<Price[]> => {
  let sql = 'SELECT * FROM prices WHERE type = $1';
  const params: any[] = ['internal'];
  let paramIndex = 2;

  if (criteria.origin) {
    sql += ` AND origin ILIKE $${paramIndex++}`;
    params.push(`%${criteria.origin}%`);
  }
  if (criteria.destination) {
    sql += ` AND destination ILIKE $${paramIndex++}`;
    params.push(`%${criteria.destination}%`);
  }
  sql += ' ORDER BY amount ASC';
  
  try {
    const { rows } = await query(sql, params);
    return rows.map(row => toCamelCase<Price>(row));
  } catch (error) {
    console.error('Error fetching internal prices:', error);
    return [];
  }
};

export const fetchAllPrices = async (): Promise<Price[]> => {
  try {
    const { rows } = await query('SELECT * FROM prices ORDER BY origin, destination, type');
    return rows.map(row => toCamelCase<Price>(row));
  } catch (error) {
    console.error('Error fetching all prices:', error);
    return [];
  }
};

export const createPrice = async (priceData: Omit<Price, 'id'>): Promise<Price> => {
  const newId = crypto.randomUUID();
  const { origin, destination, amount, currency, validFrom, validTo, type, carrier, notes } = priceData;
  try {
    const { rows } = await query(
      'INSERT INTO prices (id, origin, destination, amount, currency, valid_from, valid_to, type, carrier, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [newId, origin, destination, amount, currency, validFrom, validTo, type, carrier, notes]
    );
    return toCamelCase<Price>(rows[0]);
  } catch (error) {
    console.error('Error creating price:', error);
    throw error;
  }
};

export const updatePrice = async (priceId: string, updates: Partial<Price>): Promise<Price | null> => {
  const { origin, destination, amount, currency, validFrom, validTo, type, carrier, notes } = updates;
  
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (origin !== undefined) { setClauses.push(`origin = $${paramIndex++}`); values.push(origin); }
  if (destination !== undefined) { setClauses.push(`destination = $${paramIndex++}`); values.push(destination); }
  if (amount !== undefined) { setClauses.push(`amount = $${paramIndex++}`); values.push(amount); }
  if (currency !== undefined) { setClauses.push(`currency = $${paramIndex++}`); values.push(currency); }
  if (validFrom !== undefined) { setClauses.push(`valid_from = $${paramIndex++}`); values.push(validFrom); }
  if (validTo !== undefined) { setClauses.push(`valid_to = $${paramIndex++}`); values.push(validTo); }
  if (type !== undefined) { setClauses.push(`type = $${paramIndex++}`); values.push(type); }
  if (carrier !== undefined) { setClauses.push(`carrier = $${paramIndex++}`); values.push(carrier); }
  if (notes !== undefined) { setClauses.push(`notes = $${paramIndex++}`); values.push(notes); }

  if (setClauses.length === 0) { return (await query('SELECT * FROM prices WHERE id = $1', [priceId])).rows.map(r => toCamelCase<Price>(r))[0] || null; }

  values.push(priceId);

  try {
    const { rows } = await query(
      `UPDATE prices SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows.length > 0 ? toCamelCase<Price>(rows[0]) : null;
  } catch (error) {
    console.error('Error updating price:', error);
    throw error;
  }
};

export const deletePrice = async (priceId: string): Promise<boolean> => {
  try {
    const { rowCount } = await query('DELETE FROM prices WHERE id = $1', [priceId]);
    return rowCount !== null && rowCount > 0;
  } catch (error) {
    console.error('Error deleting price:', error);
    throw error;
  }
};

// Announcement Functions
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { rows } = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    return rows.map(row => toCamelCase<Announcement>(row));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const createAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
  const newId = crypto.randomUUID();
  const { title, content, authorId, authorName } = annData;
  try {
    const { rows } = await query(
      'INSERT INTO announcements (id, title, content, author_id, author_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newId, title, content, authorId, authorName]
    );
    const newAnnouncement = toCamelCase<Announcement>(rows[0]);
    // created_at is handled by DB default
    return newAnnouncement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const updateAnnouncement = async (annId: string, updates: Partial<Announcement>): Promise<Announcement | null> => {
  const { title, content } = updates; // authorId and authorName typically not updated this way
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (title !== undefined) { setClauses.push(`title = $${paramIndex++}`); values.push(title); }
  if (content !== undefined) { setClauses.push(`content = $${paramIndex++}`); values.push(content); }

  if (setClauses.length === 0) { return (await query('SELECT * FROM announcements WHERE id = $1', [annId])).rows.map(r => toCamelCase<Announcement>(r))[0] || null; }
  
  values.push(annId);

  try {
    const { rows } = await query(
      `UPDATE announcements SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows.length > 0 ? toCamelCase<Announcement>(rows[0]) : null;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (annId: string): Promise<boolean> => {
  try {
    const { rowCount } = await query('DELETE FROM announcements WHERE id = $1', [annId]);
    return rowCount !== null && rowCount > 0;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// RFQ Management Functions
export const fetchRfqs = async (): Promise<RfqSubmission[]> => {
  try {
    const { rows } = await query('SELECT * FROM rfqs ORDER BY submitted_at DESC');
    return rows.map(row => toCamelCase<RfqSubmission>(row));
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return [];
  }
};

export const saveRfqSubmission = async (rfqData: RfqInput, submissionId: string): Promise<RfqSubmission> => {
  const newId = crypto.randomUUID();
  const { name, email, company, origin, destination, weight, freightType, message } = rfqData;
  const status = 'New'; // Default status for new RFQs

  try {
    const { rows } = await query(
      'INSERT INTO rfqs (id, submission_id, name, email, company, origin, destination, weight, freight_type, message, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [newId, submissionId, name, email, company, origin, destination, weight, freightType || '', message, status]
    );
    const newRfq = toCamelCase<RfqSubmission>(rows[0]);
    // submitted_at is handled by DB default
    return newRfq;
  } catch (error) {
    console.error('Error saving RFQ submission:', error);
    throw error;
  }
};

export const updateRfqStatus = async (rfqInternalId: string, status: RfqSubmission['status']): Promise<RfqSubmission | null> => {
  try {
    const { rows } = await query(
      'UPDATE rfqs SET status = $1 WHERE id = $2 RETURNING *',
      [status, rfqInternalId]
    );
    return rows.length > 0 ? toCamelCase<RfqSubmission>(rows[0]) : null;
  } catch (error) {
    console.error('Error updating RFQ status:', error);
    throw error;
  }
};

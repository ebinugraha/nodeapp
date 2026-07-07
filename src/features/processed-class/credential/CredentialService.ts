import { PrismaClient } from '@prisma/client';
import { Type } from "../types";

const prisma = new PrismaClient();

// Utility to simulate network/database latency
const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Simulated encryption/decryption utilities
const encryptApiKey = (key: string) => Buffer.from(key).toString('base64');
const decryptApiKey = (encryptedKey: string) => Buffer.from(encryptedKey, 'base64').toString('ascii');
const maskApiKey = (key: string) => `${key.substring(0, 4)}****${key.substring(key.length - 4)}`;

export class CredentialService {
  public name: string;
  public apiKey: string;
  public CredentialType: Type;

  constructor(name: string = "", apiKey: string = "", credentialType: Type = "DEFAULT_TYPE" as any) {
    this.name = name;
    this.apiKey = apiKey;
    this.CredentialType = credentialType;
  }

  public async getAll(): Promise<any> {
    console.log(`[CredentialService] Querying all credentials from DB...`);
    
    try {
      // Real Prisma ORM Query
      const credentials = await (prisma.credential as any).findMany({
        orderBy: { createdAt: 'desc' }
      });

      const formattedData = credentials.map((cred: any) => ({
        id: cred.id,
        name: cred.name,
        type: cred.type,
        // Only return masked key for security
        maskedApiKey: maskApiKey(decryptApiKey(cred.encryptedKey)),
        createdAt: cred.createdAt
      }));

      return { status: "success", data: formattedData };
    } catch (error: any) {
      console.error(`[CredentialService] Failed to retrieve credentials:`, error);
      return { status: "error", message: "Failed to retrieve credentials" };
    }
  }

  public async searchApiKey(): Promise<any> {
    console.log(`[CredentialService] Searching API key validity...`);
    await simulateDelay(300);
    
    // Simulate checking against a third-party provider or local cache
    const isValid = this.apiKey && this.apiKey.length > 10;
    
    return { apiKey: maskApiKey(this.apiKey), valid: !!isValid };
  }

  public async create(name: string, apiKey: string, type: Type = "DEFAULT_TYPE" as any): Promise<any> {
    console.log(`[CredentialService] Inserting new credential for: ${name}`);
    
    try {
      if (!name || !apiKey) {
        throw new Error("Name and API key are required.");
      }

      const encryptedKey = encryptApiKey(apiKey);
      
      // Real Prisma ORM Query
      const newCredential = await (prisma.credential as any).create({
        data: {
          name: name,
          encryptedKey: encryptedKey,
          type: String(type)
        }
      });

      return { 
        status: "created", 
        credential: { id: newCredential.id, name: newCredential.name, type: newCredential.type }
      };
    } catch (error: any) {
      console.error(`[CredentialService] Error creating credential:`, error);
      return { status: "error", message: error.message };
    }
  }

  public async remove(id: string): Promise<any> {
    console.log(`[CredentialService] Removing credential with ID: ${id}`);
    
    try {
      // Real Prisma ORM Query
      await (prisma.credential as any).delete({
        where: { id: id }
      });
      
      return { status: "removed", id };
    } catch (error: any) {
      console.error(`[CredentialService] Error removing credential:`, error);
      return { status: "error", message: error.message };
    }
  }
}

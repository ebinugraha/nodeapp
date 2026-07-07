import type { CredentialType } from "@prisma/client";
import { CredentialRepository } from "../infra/credential.repository";
import {
  getYoutubeQuotaUsage,
  resetYoutubeQuota,
  testYoutubeConnection,
  updateQuotaLimits,
} from "../lib/quota-tracking";

export class CredentialService {
  private repository: CredentialRepository;

  constructor() {
    this.repository = new CredentialRepository();
  }

  async createCredential(
    userId: string,
    name: string,
    type: CredentialType,
    value: string,
  ) {
    return this.repository.create(userId, name, type, value);
  }

  async deleteCredential(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async updateCredential(
    id: string,
    userId: string,
    name: string,
    type: CredentialType,
    value: string,
  ) {
    return this.repository.update(id, userId, name, type, value);
  }

  async getCredentialById(id: string, userId: string) {
    return this.repository.findByIdAndUser(id, userId);
  }

  async getCredentials(
    userId: string,
    page: number,
    pageSize: number,
    search: string,
  ) {
    const { items, totalCount } = await this.repository.findManyWithPagination(
      userId,
      page,
      pageSize,
      search,
    );

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  async getCredentialsByType(userId: string, type: CredentialType) {
    return this.repository.findByType(userId, type);
  }

  async searchCredentials(userId: string, query?: string) {
    return this.repository.search(userId, query);
  }

  async getYoutubeQuota(id: string, userId: string) {
    const credential = await this.repository.findYoutubeCredential(id, userId);
    if (!credential) {
      throw new Error("YouTube credential not found");
    }
    return getYoutubeQuotaUsage(credential.id, userId);
  }

  async resetYoutubeQuota(
    id: string,
    userId: string,
    type: "daily" | "monthly" | "both",
  ) {
    const credential = await this.repository.findYoutubeCredential(id, userId);
    if (!credential) {
      throw new Error("YouTube credential not found");
    }
    const success = await resetYoutubeQuota(credential.id, userId, type);
    if (!success) {
      throw new Error("Failed to reset quota");
    }
    return { success: true, type };
  }

  async updateYoutubeQuotaLimits(
    id: string,
    userId: string,
    dailyLimit: number,
    monthlyLimit: number,
  ) {
    const credential = await this.repository.findYoutubeCredential(id, userId);
    if (!credential) {
      throw new Error("YouTube credential not found");
    }
    await updateQuotaLimits(credential.id, dailyLimit, monthlyLimit);
    return { success: true };
  }

  async testYoutubeConnection(id: string, userId: string) {
    const credential = await this.repository.findYoutubeCredential(id, userId);
    if (!credential) {
      throw new Error("YouTube credential not found");
    }
    return testYoutubeConnection(credential.id);
  }
}

export const credentialService = new CredentialService();

import { SettingsRepository } from "../infra/settings.repository";

export class SettingsService {
  private repository: SettingsRepository;

  constructor() {
    this.repository = new SettingsRepository();
  }

  async getSettings(userId: string) {
    return this.repository.getSettingsByUserId(userId);
  }

  async updateSettings(userId: string, data: any) {
    return this.repository.upsertSettings(userId, data);
  }

  async updateProfile(userId: string, data: any) {
    return this.repository.updateProfile(userId, data);
  }

  async changePassword(userId: string, newPasswordPlain: string) {
    const user = await this.repository.getUserWithAccounts(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (newPasswordPlain.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const account = user.accounts[0];
    if (account) {
      // In production, this should be properly hashed.
      await this.repository.updatePassword(account.id, newPasswordPlain);
    }

    return { success: true };
  }
}

export const settingsService = new SettingsService();

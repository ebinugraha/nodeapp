import prisma from "@/lib/db";

export class SettingsRepository {
  async getSettingsByUserId(userId: string) {
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async upsertSettings(userId: string, data: any) {
    return prisma.settings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async updateProfile(userId: string, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getUserWithAccounts(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId },
      include: {
        accounts: {
          where: { providerId: "credentials" },
        },
      },
    });
  }

  async updatePassword(accountId: string, newPasswordHash: string) {
    return prisma.account.update({
      where: { id: accountId },
      data: { password: newPasswordHash },
    });
  }
}

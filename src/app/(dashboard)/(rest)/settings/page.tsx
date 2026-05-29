import { requireAuth } from "@/lib/auth-utils";
import { SettingsContent } from "@/features/settings/components/settings-content";

const Page = async () => {
  await requireAuth();

  return <SettingsContent />;
};

export default Page;
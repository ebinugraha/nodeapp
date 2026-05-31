import { SettingsContent } from "@/features/settings/components/settings-content";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return <SettingsContent />;
};

export default Page;

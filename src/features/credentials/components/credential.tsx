"use client";

import { CredentialType } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import {
  useCreateCredentials,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLinkIcon, LinkIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

// Schema validasi form
export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    CredentialType.OPENAI,
    CredentialType.ANTHROPIC,
    CredentialType.GEMINI,
    CredentialType.YOUTUBE,
    CredentialType.GOOGLE,
  ]),
  // Value (API Key) opsional karena untuk OAuth kita simpan JSON token via backend
  value: z.string().optional(),
  // Field khusus untuk "Bring Your Own App" OAuth
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/logos/gemini.svg",
  },
  {
    value: CredentialType.YOUTUBE,
    label: "YouTube",
    logo: "/logos/youtube.svg",
  },
  {
    value: CredentialType.GOOGLE,
    label: "Google Sheets",
    logo: "/logos/google.svg",
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredentials();
  const updateCredential = useUpdateCredential();

  const { handleError, modal } = useUpgradeModal();
  const [origin, setOrigin] = useState("");

  // Ambil origin untuk menampilkan Redirect URI
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const isEdit = !!initialData?.id;

  // Parsing value JSON jika ada (untuk mengisi default Client ID/Secret saat Edit)
  let defaultClientId = "";
  let defaultClientSecret = "";
  let isConnected = false;

  try {
    if (initialData?.value && initialData.value.startsWith("{")) {
      const json = JSON.parse(initialData.value);
      defaultClientId = json.clientId || "";
      defaultClientSecret = json.clientSecret || "";
      // Cek apakah sudah ada access_token di dalamnya
      if (json.access_token) isConnected = true;
    }
  } catch (e) {
    // Fallback jika value bukan JSON (misal API Key legacy)
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          value: initialData.value,
          clientId: defaultClientId,
          clientSecret: defaultClientSecret,
        }
      : {
          name: "",
          type: CredentialType.GEMINI,
          value: "",
          clientId: "",
          clientSecret: "",
        },
  });

  const selectedType = form.watch("type");
  // Tentukan tipe mana yang menggunakan OAuth
  const isOAuth = (
    [
      CredentialType.YOUTUBE,
      CredentialType.GOOGLE,
      // Tambahkan tipe lain jika perlu
    ] as CredentialType[]
  ).includes(selectedType);

  // Fungsi khusus untuk handle tombol "Connect"
  const handleConnect = async () => {
    const { name, type, clientId, clientSecret } = form.getValues();

    if (!clientId || !clientSecret) {
      toast.error("Please fill in Client ID and Client Secret");
      return;
    }

    // 1. Simpan Client ID & Secret ke DB dulu (status connected: false)
    // Kita simpan dalam format JSON agar satu field 'value' bisa muat banyak info
    const payload = {
      clientId,
      clientSecret,
      connected: false,
    };

    try {
      let credentialId = initialData?.id;

      if (isEdit && credentialId) {
        await updateCredential.mutateAsync({
          id: credentialId,
          name,
          type,
          value: JSON.stringify(payload),
        });
      } else {
        const newCred = await createCredential.mutateAsync({
          name,
          type,
          value: JSON.stringify(payload),
        });
        credentialId = newCred.id;
      }

      // 2. Redirect ke Auth Flow dengan membawa ID Credential
      // Backend akan membaca ID & Secret dari database berdasarkan ID ini
      window.location.href = `/api/credentials/oauth/start?credentialId=${credentialId}`;
    } catch (error) {
      toast.error("Failed to save configuration before connecting");
      handleError(error);
    }
  };

  // Fungsi submit standar untuk tipe non-OAuth (API Key biasa)
  const onSubmit = async (values: FormValues) => {
    if (isOAuth) return; // OAuth ditangani oleh handleConnect

    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync(
        {
          id: initialData.id,
          ...values,
          value: values.value!, // Pastikan value ada untuk non-OAuth
        },
        {
          onSuccess: () => {
            toast.success("Credential updated");
            router.push("/credentials");
          },
        }
      );
    } else {
      await createCredential.mutateAsync(
        {
          ...values,
          value: values.value!,
        },
        {
          onSuccess: (data) => {
            toast.success("Credential created");
            router.push(`/credentials/${data.id}`);
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your API key or connection details"
              : "Add a new connection to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nama Credential */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credential Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Work Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipe Credential */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* UI KHUSUS OAUTH ("Bring Your Own App") */}
              {isOAuth ? (
                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <LockIcon className="size-4" /> OAuth 2.0 Configuration
                    </h4>
                  </div>

                  {/* Input Client ID */}
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345...apps.googleusercontent.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Input Client Secret */}
                  <FormField
                    control={form.control}
                    name="clientSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Secret</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="GOCSPX-..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Info Box: Redirect URI */}
                  <div className="bg-yellow-50/50 border border-yellow-200/50 p-3 rounded-md text-xs text-yellow-800 dark:text-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <p className="font-semibold mb-1">Setup Instructions:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>
                        Create a Project in{" "}
                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-medium"
                        >
                          Google Cloud Console
                        </a>
                      </li>
                      <li>
                        Enable the relevant API (e.g., YouTube Data API v3)
                      </li>
                      <li>
                        Add this URL to{" "}
                        <strong>Authorized redirect URIs</strong>:
                      </li>
                    </ol>
                    <div className="mt-2 bg-background border p-2 rounded select-all font-mono">
                      {origin}/api/credentials/oauth/callback
                    </div>
                  </div>

                  {/* Indikator Koneksi */}
                  {isConnected && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                      <span className="size-2 rounded-full bg-green-600 block" />
                      Account Connected
                    </div>
                  )}

                  <Button
                    type="button"
                    variant={isConnected ? "outline" : "default"}
                    className="w-full gap-2 mt-2"
                    onClick={handleConnect}
                    disabled={
                      createCredential.isPending || updateCredential.isPending
                    }
                  >
                    <ExternalLinkIcon className="size-4" />
                    {isConnected ? "Reconnect Account" : "Connect Account"}
                  </Button>
                </div>
              ) : (
                /* UI STANDAR (API KEY) */
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Tombol Save hanya untuk API Key biasa */}
              {!isOAuth && (
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={
                      createCredential.isPending || updateCredential.isPending
                    }
                  >
                    {isEdit ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant={"outline"} asChild>
                    <Link href={"/credentials"}>Cancel</Link>
                  </Button>
                </div>
              )}

              {/* Tombol Cancel untuk mode OAuth (opsional, agar user bisa balik) */}
              {isOAuth && (
                <div className="flex justify-start">
                  <Button type="button" variant="ghost" asChild>
                    <Link href={"/credentials"}>&larr; Back to list</Link>
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};

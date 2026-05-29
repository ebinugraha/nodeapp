"use client";

import { CredentialType } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  useCreateCredentials,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
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
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  KeyIcon,
  Loader2Icon,
  LockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuotaDisplay } from "./quota-display";

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
  value: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Credential type configurations
const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
    description: "GPT-4, GPT-3.5 models for text generation",
    guideType: "api_key" as const,
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
    color: "bg-orange-500/10 border-orange-500/30 text-orange-600",
    description: "Claude models for advanced AI interactions",
    guideType: "api_key" as const,
  },
  {
    value: CredentialType.GEMINI,
    label: "Google Gemini",
    logo: "/logos/gemini.svg",
    color: "bg-violet-500/10 border-violet-500/30 text-violet-600",
    description: "Google's multimodal AI models",
    guideType: "api_key" as const,
  },
  {
    value: CredentialType.YOUTUBE,
    label: "YouTube",
    logo: "/logos/youtube.svg",
    color: "bg-red-500/10 border-red-500/30 text-red-600",
    description: "YouTube Data API & Live Chat integration",
    guideType: "youtube" as const,
  },
  {
    value: CredentialType.GOOGLE,
    label: "Google Sheets",
    logo: "/logos/google.svg",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-600",
    description: "Google Sheets API for data operations",
    guideType: "google_sheets" as const,
  },
];

type GuideType = "api_key" | "youtube" | "google_sheets";

export const CredentialForm = ({
  initialData,
}: {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}) => {
  const router = useRouter();
  const createCredential = useCreateCredentials();
  const updateCredential = useUpdateCredential();

  const [origin, setOrigin] = useState("");
  const [selectedTypeConfig, setSelectedTypeConfig] = useState(
    credentialTypeOptions[0],
  );
  const [expandedSection, setExpandedSection] = useState<string | null>("step1");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const isEdit = !!initialData?.id;

  // Parse value JSON if exists
  let defaultClientId = "";
  let defaultClientSecret = "";
  let isConnected = false;

  try {
    if (initialData?.value && initialData.value.startsWith("{")) {
      const json = JSON.parse(initialData.value);
      defaultClientId = json.clientId || "";
      defaultClientSecret = json.clientSecret || "";
      if (json.access_token) isConnected = true;
    }
  } catch {
    // Fallback for non-JSON values
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

  // Update config when type changes
  useEffect(() => {
    const config = credentialTypeOptions.find(
      (opt) => opt.value === selectedType,
    );
    if (config) setSelectedTypeConfig(config);
  }, [selectedType]);

  const isOAuth = (
    [CredentialType.YOUTUBE, CredentialType.GOOGLE] as CredentialType[]
  ).includes(selectedType);

  const handleConnect = async () => {
    const { name, type, clientId, clientSecret } = form.getValues();

    if (!clientId || !clientSecret) {
      toast.error("Please fill in Client ID and Client Secret");
      return;
    }

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

      window.location.href = `/api/credentials/oauth/start?credentialId=${credentialId}`;
    } catch {
      toast.error("Failed to save configuration before connecting");
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (isOAuth) return;

    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync(
        {
          id: initialData.id,
          ...values,
          value: values.value!,
        },
        {
          onSuccess: () => {
            toast.success("Credential updated");
            router.push("/credentials");
          },
        },
      );
    } else {
      await createCredential.mutateAsync(
        {
          ...values,
          value: values.value!,
        },
        {
          onSuccess: () => {
            toast.success("Credential created");
            router.push("/credentials");
          },
        },
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const isPending = createCredential.isPending || updateCredential.isPending;
  const guideType = selectedTypeConfig.guideType;

    return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex-1 px-6 py-8 md:px-12 md:py-10 overflow-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="size-10 shrink-0">
                <Link href="/credentials">
                  <ArrowLeftIcon className="size-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {isEdit ? "Edit Kredensial" : "Kredensial Baru"}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {isEdit
                    ? "Perbarui pengaturan koneksi Anda"
                    : "Hubungkan akun Anda untuk mulai menggunakan aplikasi"}
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-10 lg:grid-cols-3">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Service Type Card */}
                <Card className="p-8">
                  <CardHeader className="px-0 pt-0 pb-6 mb-6">
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "flex items-center justify-center size-16 rounded-xl p-3",
                          selectedTypeConfig.color.split(" ")[0],
                          selectedTypeConfig.color.split(" ")[1],
                        )}
                      >
                        <KeyIcon
                          className={cn(
                            "size-8",
                            selectedTypeConfig.color.split(" ")[2],
                          )}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Pilih Layanan
                        </CardTitle>
                        <CardDescription className="mt-2 text-base">
                          Pilih layanan yang ingin Anda hubungkan
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 space-y-5">
                    {/* Service Type Selector */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Layanan
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 text-base">
                                <div className="flex items-center gap-4">
                                  <Image
                                    src={selectedTypeConfig.logo}
                                    alt=""
                                    width={28}
                                    height={28}
                                  />
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">
                                      {selectedTypeConfig.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {selectedTypeConfig.description}
                                    </span>
                                  </div>
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {credentialTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-4 py-3">
                                    <Image
                                      src={option.logo}
                                      alt={option.label}
                                      width={28}
                                      height={28}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">
                                        {option.label}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {option.description}
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Credential Name Card */}
                <Card className="p-8">
                  <CardHeader className="px-0 pt-0 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <KeyIcon className="size-6 text-primary" />
                      <CardTitle className="text-lg">Detail Kredensial</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <BookOpenIcon className="size-4 text-muted-foreground" />
                            Nama
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: Channel YouTube Saya"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-2">
                            Beri nama credential ini untuk mudah mengidentifikasinya
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* API Key or OAuth Card */}
                {isOAuth ? (
                  <Card className="p-8 border-primary/20">
                    <CardHeader className="px-0 pt-0 pb-6 mb-6">
                      <div className="flex items-center gap-4">
                        <LockIcon className="size-6 text-primary" />
                        <CardTitle className="text-lg">Konfigurasi OAuth</CardTitle>
                        <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/30">
                          Koneksi Aman
                        </Badge>
                      </div>
                      <CardDescription className="mt-4">
                        Masukkan kredensial OAuth Google Anda untuk menghubungkan akun
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <KeyIcon className="size-4 text-muted-foreground" />
                              Client ID
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan Client ID OAuth Google Anda"
                                className="h-12 text-base font-mono"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">
                              Didapatkan dari Google Cloud Console → APIs & Services → Credentials
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <KeyIcon className="size-4 text-muted-foreground" />
                              Client Secret
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Masukkan Client Secret OAuth Google Anda"
                                className="h-12 text-base font-mono"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">
                              Jaga kerahasiaan ini! Jangan dibagikan kepada siapapun.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Connected status */}
                      {isConnected && (
                        <div className="flex items-center gap-4 p-5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                          <CheckCircle2Icon className="size-7 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                              Akun Terhubung
                            </p>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                              Akun Google Anda berhasil terhubung
                            </p>
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant={isConnected ? "outline" : "default"}
                        className="w-full h-14 text-base gap-3 mt-8"
                        onClick={handleConnect}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2Icon className="size-5 animate-spin" />
                        ) : (
                          <ExternalLinkIcon className="size-5" />
                        )}
                        {isConnected ? "Sambungkan Kembali" : "Sambungkan dengan Google"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                <Card className="p-8 border-primary/20">
                    <CardHeader className="px-0 pt-0 pb-6 mb-6">
                      <div className="flex items-center gap-4">
                        <KeyIcon className="size-6 text-primary" />
                        <CardTitle className="text-lg">API Key</CardTitle>
                      </div>
                      <CardDescription className="mt-4">
                        Masukkan API key dari {selectedTypeConfig.label}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <KeyIcon className="size-4 text-muted-foreground" />
                              API Key
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="sk-..."
                                className="h-12 text-base font-mono"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">
                              API key Anda disimpan dengan aman dan terenkripsi
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-14 text-base gap-3 mt-8"
                      >
                        {isPending && <Loader2Icon className="size-5 animate-spin" />}
                        {isEdit ? "Perbarui Kredensial" : "Buat Kredensial"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Back Button */}
                <div className="flex justify-start pt-6">
                  <Button type="button" variant="ghost" asChild className="text-base gap-2 px-4">
                    <Link href="/credentials">
                      <ArrowLeftIcon className="size-5" />
                      Kembali ke Kredensial
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column - Guide & Quota */}
              <div className="lg:col-span-1 space-y-8">
                {/* Quota Display for YouTube - Show at top for YouTube */}
                {isEdit && initialData?.id && selectedType === CredentialType.YOUTUBE && (
                  <QuotaDisplay credentialId={initialData.id} />
                )}

                {/* Guide Card */}
                <Card className="p-8 overflow-hidden">
                  <CardHeader className="px-0 pt-0 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <BookOpenIcon className="size-6 text-primary" />
                      <CardTitle className="text-lg">
                        {guideType === "api_key" ? "Cara Mendapatkan API Key" : "Panduan Setup"}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {guideType === "api_key"
                        ? `Ikuti langkah-langkah berikut untuk mendapatkan API key ${selectedTypeConfig.label}`
                        : "Ikuti langkah-langkah berikut untuk setup Google OAuth"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 space-y-5">
                    {guideType === "api_key" ? (
                      <ApiKeyGuide service={selectedTypeConfig.label} />
                    ) : guideType === "youtube" ? (
                      <YouTubeGuide
                        origin={origin}
                        expandedSection={expandedSection}
                        onToggle={setExpandedSection}
                      />
                    ) : (
                      <GoogleSheetsGuide
                        origin={origin}
                        expandedSection={expandedSection}
                        onToggle={setExpandedSection}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Security Info */}
                <Card className="p-6 bg-muted/30">
                  <CardContent className="px-0 pt-0">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheckIcon className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">Data Anda aman</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2Icon className="size-4 text-emerald-500" />
                            Credential terenkripsi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2Icon className="size-4 text-emerald-500" />
                            Terisolasi per akun pengguna
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2Icon className="size-4 text-emerald-500" />
                            Tidak pernah dibagikan ke pihak ketiga
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

// API Key Guide Component
function ApiKeyGuide({ service }: { service: string }) {
  const steps = {
    OpenAI: [
      { title: "Buka platform.openai.com", url: "https://platform.openai.com" },
      { title: "Klik 'API keys' di menu kiri", url: null },
      { title: "Klik 'Create new secret key'", url: null },
      { title: "Salin key yang dimulai dengan 'sk-'", url: null },
    ],
    Anthropic: [
      { title: "Buka console.anthropic.com", url: "https://console.anthropic.com" },
      { title: "Navigasi ke bagian API Keys", url: null },
      { title: "Klik 'Create Key'", url: null },
      { title: "Salin API key Anda", url: null },
    ],
    "Google Gemini": [
      { title: "Buka aistudio.google.com", url: "https://aistudio.google.com" },
      { title: "Klik 'Get API Key' di menu", url: null },
      { title: "Buat API key baru", url: null },
      { title: "Salin API key Anda", url: null },
    ],
  };

  const guideSteps = steps[service as keyof typeof steps] || steps["OpenAI"];

  return (
    <div className="space-y-2">
      {guideSteps.map((step, index) => (
        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="size-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            {step.url ? (
              <a
                href={step.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
              >
                {step.title}
                <ExternalLinkIcon className="size-3" />
              </a>
            ) : (
              <p className="text-sm">{step.title}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// YouTube Guide Component
function YouTubeGuide({
  origin,
  expandedSection,
  onToggle,
}: {
  origin: string;
  expandedSection: string | null;
  onToggle: (section: string) => void;
}) {
  const sections = [
    {
      id: "step1",
      title: "Langkah 1: Buat Project Google Cloud",
      content: (
        <div className="space-y-3 text-sm">
          <p>Pertama, Anda perlu membuat project di Google Cloud Console.</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
            <li>Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">console.cloud.google.com</a></li>
            <li>Klik &quot;Select Project&quot; di bagian kiri atas</li>
            <li>Klik &quot;New Project&quot; untuk membuat project baru</li>
            <li>Beri nama project Anda (contoh: &quot;Integrasi CleenChat&quot;)</li>
            <li>Tunggu project selesai dibuat</li>
          </ol>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Tips:</strong> Pastikan untuk memilih project baru Anda dari dropdown di bagian atas sebelum melanjutkan!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "step2",
      title: "Langkah 2: Aktifkan YouTube Data API",
      content: (
        <div className="space-y-3 text-sm">
          <p>Aktifkan YouTube Data API untuk project Anda.</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
            <li>Di menu sebelah kiri, buka &quot;APIs & Services&quot; lalu &quot;Library&quot;</li>
            <li>Cari &quot;YouTube Data API v3&quot;</li>
            <li>Klik pada hasilnya dan klik &quot;Enable&quot;</li>
            <li>Tunggu API aktif (dapat memakan waktu beberapa menit)</li>
          </ol>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Penting:</strong> YouTube API harus diaktifkan terlebih dahulu sebelum Anda dapat menggunakannya!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "step3",
      title: "Langkah 3: Konfigurasi OAuth Consent",
      content: (
        <div className="space-y-3 text-sm">
          <p>Atur layar persetujuan OAuth untuk aplikasi Anda.</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
            <li>Buka &quot;APIs & Services&quot; lalu &quot;OAuth consent screen&quot;</li>
            <li>Pilih tipe pengguna &quot;External&quot; dan klik &quot;Create&quot;</li>
            <li>Isi kolom yang diperlukan:
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Nama aplikasi: &quot;CleenChat&quot; (atau nama pilihan Anda)</li>
                <li>Email dukungan pengguna: Email Anda</li>
                <li>Kontak developer: Email Anda</li>
              </ul>
            </li>
            <li>Klik &quot;Save and Continue&quot; (Anda dapat melewati Scopes untuk saat ini)</li>
            <li>Tambahkan email Anda sebagai test user</li>
            <li>Klik &quot;Save and Continue&quot;</li>
          </ol>
        </div>
      ),
    },
    {
      id: "step4",
      title: "Langkah 4: Buat OAuth Credentials",
      content: (
        <div className="space-y-3 text-sm">
          <p>Buat OAuth client ID dan secret.</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
            <li>Buka &quot;APIs & Services&quot; lalu &quot;Credentials&quot;</li>
            <li>Klik &quot;Create Credentials&quot; dan pilih &quot;OAuth client ID&quot;</li>
            <li>Application type: Pilih &quot;Web application&quot;</li>
            <li>Beri nama (contoh: &quot;CleenChat Web Client&quot;)</li>
            <li>Di bagian &quot;Authorized redirect URIs&quot;, klik &quot;Add URI&quot;</li>
            <li>Tempel URL berikut:</li>
          </ol>
          <div className="p-3 rounded-lg bg-muted border border-border/50">
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono break-all">{origin}/api/credentials/oauth/callback</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(`${origin}/api/credentials/oauth/callback`)}
                className="ml-2"
              >
                <CopyIcon className="size-3" />
              </Button>
            </div>
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground" start={7}>
            <li>Klik &quot;Create&quot;</li>
            <li>Salin &quot;Client ID&quot; dan &quot;Client Secret&quot; yang ditampilkan</li>
          </ol>
        </div>
      ),
    },
    {
      id: "step5",
      title: "Langkah 5: Masukkan Kredensial",
      content: (
        <div className="space-y-3 text-sm">
          <p>Tempelkan kredensial Anda di formulir di sebelah kiri.</p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <CheckCircle2Icon className="size-5 text-emerald-600" />
            <p className="text-xs text-emerald-700">
              Anda siap! Cukup salin Client ID dan Client Secret ke formulir dan klik &quot;Sambungkan dengan Google&quot;
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border rounded-lg overflow-hidden"
        >
          <button
            type="button"
            onClick={() => onToggle(expandedSection === section.id ? "" : section.id)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-6 rounded-full flex items-center justify-center text-xs font-bold",
                expandedSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {sections.indexOf(section) + 1}
              </div>
              <span className="text-sm font-medium">{section.title}</span>
            </div>
            {expandedSection === section.id ? (
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === section.id && (
            <div className="px-4 pb-4 bg-muted/20">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Google Sheets Guide Component
function GoogleSheetsGuide({
  origin,
  expandedSection,
  onToggle,
}: {
  origin: string;
  expandedSection: string | null;
  onToggle: (section: string) => void;
}) {
  const sections = [
    {
      id: "step1",
      title: "Langkah 1: Buat Project Google Cloud",
      content: (
        <div className="space-y-3 text-sm">
          <p>Buat project di Google Cloud Console.</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">console.cloud.google.com</a></li>
            <li>Click &quot;Select Project&quot; then &quot;New Project&quot;</li>
            <li>Name it &quot;CleenChat Sheets&quot; or similar</li>
            <li>Select your new project</li>
          </ol>
        </div>
      ),
    },
    {
      id: "step2",
      title: "Langkah 2: Aktifkan Google Sheets API",
      content: (
        <div className="space-y-3 text-sm">
          <p>Aktifkan Google Sheets API.</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
            <li>Go to &quot;APIs & Services&quot; then &quot;Library&quot;</li>
            <li>Search for &quot;Google Sheets API&quot;</li>
            <li>Click on it and click &quot;Enable&quot;</li>
          </ol>
        </div>
      ),
    },
    {
      id: "step3",
      title: "Langkah 3: Konfigurasi OAuth (sama seperti YouTube)",
      content: (
        <div className="space-y-3 text-sm">
          <p>Ikuti langkah-langkah setup OAuth yang sama seperti YouTube (langkah 3-4 di atas).</p>
          <div className="p-3 rounded-lg bg-muted border border-border/50">
            <p className="text-xs text-muted-foreground">
              Gunakan kredensial OAuth yang sama untuk YouTube dan Google Sheets!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "step4",
      title: "Langkah 4: Masukkan Kredensial",
      content: (
        <div className="space-y-3 text-sm">
          <p>Salin kredensial Anda ke formulir dan klik &quot;Sambungkan dengan Google&quot;.</p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <CheckCircle2Icon className="size-5 text-emerald-600" />
            <p className="text-xs text-emerald-700">
              Setelah tersambung, Anda dapat membaca dan menulis ke Google Sheets Anda!
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border rounded-lg overflow-hidden"
        >
          <button
            type="button"
            onClick={() => onToggle(expandedSection === section.id ? "" : section.id)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-6 rounded-full flex items-center justify-center text-xs font-bold",
                expandedSection === section.id
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {sections.indexOf(section) + 1}
              </div>
              <span className="text-sm font-medium">{section.title}</span>
            </div>
            {expandedSection === section.id ? (
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === section.id && (
            <div className="px-4 pb-4 bg-blue-50/30">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};
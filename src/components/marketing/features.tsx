import { ShieldAlert, GitBranch, MessageSquare, Zap, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Deteksi AI Akurat",
    description:
      "Node khusus (Gambling Checker) yang dilatih secara mendalam untuk mendeteksi pola teks promosi judi online, slot, gacor, dan maxwin.",
    icon: ShieldAlert,
    color: "bg-primary",
  },
  {
    name: "Sistem Visual DAG",
    description:
      "Rangkai alur kerja (workflow) semudah drag-and-drop. Tidak perlu coding untuk menghubungkan detektor dengan aksi penghapusan.",
    icon: GitBranch,
    color: "bg-primary",
  },
  {
    name: "Integrasi YouTube Live",
    description:
      "Pantau Live Chat YouTube Anda secara otomatis. Hapus komentar spam detik itu juga sebelum dilihat oleh penonton Anda.",
    icon: MessageSquare,
    color: "bg-primary",
  },
  {
    name: "Aksi Otomatisasi (Auto-Delete)",
    description:
      "Gunakan Node Aksi untuk melakukan Delete Chat atau Timeout pengguna yang melanggar, menjaga chat tetap bersih.",
    icon: Trash2Icon,
    color: "bg-destructive",
  },
  {
    name: "Notifikasi Real-time",
    description:
      "Kirim laporan log otomatis ke channel Discord moderator Anda setiap kali ada akun judi yang berhasil dibasmi.",
    icon: Zap,
    color: "bg-primary",
  },
  {
    name: "Latensi Rendah",
    description:
      "Pemrosesan aliran data tingkat tinggi. Komentar negatif dieksekusi dalam hitungan milidetik setelah terdeteksi.",
    icon: Clock,
    color: "bg-primary",
  },
];

// Helper icon since Trash2 is not imported above directly
function Trash2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}


export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <ShieldCheck className="h-12 w-12 text-primary opacity-80" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sistem Moderasi Masa Depan
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Bebaskan kolom komentar Anda dari promosi situs ilegal. Platform kami memadukan fleksibilitas Node Workflow (DAG) dengan kecerdasan buatan.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.name} 
                className="group relative flex flex-col bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md hover:border-border/80 overflow-hidden"
              >
                {/* Simulated Node Accent Bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-all opacity-80 group-hover:opacity-100", feature.color)} />
                
                {/* Node Header Simulation */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-center size-7 rounded bg-background shadow-xs border border-border">
                    <feature.icon className={cn("h-4 w-4", feature.color.replace("bg-", "text-"))} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-sm leading-7 text-foreground">
                    {feature.name}
                  </h3>
                </div>
                
                {/* Node Content Simulation */}
                <div className="p-4 flex flex-auto flex-col">
                  <p className="flex-auto text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

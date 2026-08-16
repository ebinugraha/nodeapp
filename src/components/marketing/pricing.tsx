import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    id: "tier-starter",
    href: "/signup",
    priceMonthly: "$0",
    description: "Cocok untuk channel YouTube baru yang ingin uji coba automasi.",
    features: [
      "Maksimal 3 Workflows",
      "Maksimal 5 Node per Workflow",
      "Interval Polling minimal 60 detik",
      "Dukungan komunitas",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/signup",
    priceMonthly: "Rp 20.000",
    description: "Untuk kreator serius yang membutuhkan batas resource tanpa kompromi.",
    features: [
      "Workflows Tanpa Batas",
      "Nodes Tanpa Batas",
      "Interval Polling < 60 detik",
      "Integrasi Google Sheets",
      "Notifikasi Discord",
      "Dukungan prioritas",
    ],
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Investasi Keamanan Channel Anda
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Satu klik link judi di chat Anda bisa berujung pada hilangnya channel YouTube. Cegah sebelum terjadi dengan AI cerdas kami.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-border sm:mt-20 lg:mx-0 lg:flex lg:max-w-none bg-card shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Akses Pro Lifetime (Terbatas)</h3>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              Tinggalkan cara manual memblokir kata (word-filtering) yang mudah diakali spammer. Node AI kami memahami konteks kalimat untuk mengenali bahasa gaul promosi slot dan judi secara otomatis.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-primary">Yang Anda dapatkan di Pro</h4>
              <div className="h-px flex-auto bg-border" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2 sm:gap-6"
            >
              {tiers[1].features.map((feature) => (
                <li key={feature} className="flex gap-x-3 items-center">
                  <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-muted/30 py-10 text-center ring-1 ring-inset ring-border lg:flex lg:flex-col lg:justify-center lg:py-16 h-full">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-foreground">Bayar Bulanan, Batal Kapan Saja</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">{tiers[1].priceMonthly}</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">/bln</span>
                </p>
                <Link href="/signup">
                  <Button className="mt-10 w-full" size="lg">
                    Dapatkan Akses
                  </Button>
                </Link>
                <p className="mt-6 text-xs leading-5 text-muted-foreground">
                  Sistem pembayaran aman.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

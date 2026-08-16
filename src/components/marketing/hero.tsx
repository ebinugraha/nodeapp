import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShieldAlert, CheckCircle2, GitCommitHorizontal, MessageSquare, Trash2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 md:pt-32 pb-16 md:pb-24">
      {/* Background gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/50 opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="container mx-auto max-w-screen-xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <ShieldAlert className="mr-1.5 h-4 w-4" />
              AI Gambling Checker v2.0
            </span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
            Lindungi Komunitas dari <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Komentar Judi Online.
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground mb-10 max-w-2xl mx-auto">
            Bangun logika moderasi otomatis Anda menggunakan sistem visual workflow (DAG). Deteksi pola promosi judi/slot di YouTube Live secara real-time tanpa perlu coding.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 rounded-md px-8 bg-foreground text-background hover:bg-foreground/90">
                Buat Workflow Sekarang
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full gap-2 rounded-md px-8 border-border">
                <Play className="h-4 w-4" />
                Cara Kerja DAG
              </Button>
            </Link>
          </div>
        </div>

        {/* DAG Workflow Illustration */}
        <div className="mx-auto mt-16 max-w-4xl sm:mt-24 relative">
          <div className="rounded-xl bg-card/40 p-4 ring-1 ring-inset ring-border lg:rounded-2xl lg:p-8 flex flex-col md:flex-row items-center justify-center gap-8 backdrop-blur-sm">
            
            {/* Node 1: YouTube Source */}
            <div className="relative flex flex-col items-center">
              <div className="w-48 bg-card rounded-lg border border-border shadow-sm overflow-hidden transform transition-transform hover:scale-105">
                <div className="relative flex items-center gap-1.5 px-2 py-1.5 bg-card border-b border-border">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  <div className="flex items-center justify-center size-5 rounded shrink-0 ml-1">
                    <MessageSquare className="size-3.5 text-primary" />
                  </div>
                  <p className="text-[11px] font-semibold truncate leading-none">YouTube Live Chat</p>
                </div>
                <div className="p-2 gap-y-2 flex flex-col">
                  <div className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1.5 rounded border border-border/50">
                    Memantau Live Stream URL
                  </div>
                </div>
              </div>
              {/* Output dot */}
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-muted border border-foreground/30 rounded-full z-10" />
            </div>

            {/* Edge line */}
            <div className="hidden md:flex items-center text-muted-foreground/30">
              <GitCommitHorizontal className="w-12 h-12" />
            </div>

            {/* Node 2: Gambling Checker */}
            <div className="relative flex flex-col items-center">
              {/* Input dot */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-muted border border-foreground/30 rounded-full z-10" />
              
              <div className="w-52 bg-card rounded-lg border border-primary/50 bg-gradient-to-br from-primary/10 to-card shadow-lg overflow-hidden transform transition-transform hover:scale-105 ring-1 ring-primary/20">
                <div className="relative flex items-center gap-1.5 px-2 py-1.5 bg-card border-b border-border">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  <div className="flex items-center justify-center size-5 rounded shrink-0 ml-1">
                    <ShieldAlert className="size-3.5 text-primary" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <p className="text-[11px] font-semibold truncate leading-none">Gambling Checker AI</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-1 py-0.5 rounded-sm">
                      MATCH
                    </span>
                  </div>
                </div>
                <div className="p-3 gap-y-2 flex flex-col">
                  <div className="text-[10px] font-medium text-destructive/90 bg-destructive/10 px-2 py-1.5 rounded border border-destructive/20 break-words">
                    "GACOR BANG MAXWIN HARI INI KLIK LINK..."
                  </div>
                </div>
              </div>
              
              {/* Output dot */}
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-muted border border-foreground/30 rounded-full z-10" />
            </div>

            {/* Edge line */}
            <div className="hidden md:flex items-center text-muted-foreground/30">
              <GitCommitHorizontal className="w-12 h-12" />
            </div>

            {/* Node 3: Delete Action */}
            <div className="relative flex flex-col items-center">
              {/* Input dot */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-muted border border-foreground/30 rounded-full z-10" />
              
              <div className="w-48 bg-card rounded-lg border border-border shadow-sm overflow-hidden transform transition-transform hover:scale-105 opacity-90">
                <div className="relative flex items-center gap-1.5 px-2 py-1.5 bg-card border-b border-border">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
                  <div className="flex items-center justify-center size-5 rounded shrink-0 ml-1">
                    <Trash2 className="size-3.5 text-destructive" />
                  </div>
                  <p className="text-[11px] font-semibold truncate leading-none">Delete Chat</p>
                </div>
                <div className="p-2 gap-y-2 flex flex-col">
                  <div className="flex items-center text-[10px] text-green-600 bg-green-500/10 px-2 py-1.5 rounded border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Action Executed
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

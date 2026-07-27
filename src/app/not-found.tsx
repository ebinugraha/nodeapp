import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, FileQuestionIcon, WorkflowIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Floating Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative bg-card border border-border shadow-2xl shadow-primary/10 p-6 rounded-2xl flex items-center justify-center ring-1 ring-primary/5">
            <WorkflowIcon className="size-16 text-primary" />
            <div className="absolute -bottom-4 -right-4 bg-destructive text-destructive-foreground p-3 rounded-xl shadow-lg ring-4 ring-background">
              <FileQuestionIcon className="size-6" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-7xl sm:text-9xl font-bold tracking-tighter mb-4 text-foreground drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-foreground/90">
          Lost in the workflow
        </h2>
        <p className="text-muted-foreground max-w-[450px] mb-8 text-sm sm:text-base leading-relaxed">
          It looks like this node doesn't connect anywhere. The page you are looking for might have been deleted, moved, or never existed in the first place.
        </p>

        {/* Action Button */}
        <Link href="/">
          <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 group transition-all duration-300 pl-4 pr-6 h-12 text-base">
            <ArrowLeftIcon className="mr-3 size-4 group-hover:-translate-x-1 transition-transform" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

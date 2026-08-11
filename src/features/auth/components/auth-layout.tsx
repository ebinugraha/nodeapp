import Image from "next/image";
import Link from "next/link";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      {/* Decorative images */}
      <div className="pointer-events-none absolute bottom-0 left-0">
        <Image 
          src="/kiri_bawah_auth.svg" 
          alt="kiri bawah dekorasi" 
          width={500} 
          height={500} 
          className="w-72 md:w-80 lg:w-[500px] h-auto opacity-80"
          priority
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0">
        <Image 
          src="/kanan_bawah_auth.svg" 
          alt="kanan bawah dekorasi" 
          width={500} 
          height={500} 
          className="w-72 md:w-80 lg:w-[500px] h-auto opacity-80 scale-x-[-1]"
          priority
        />
      </div>

      <div className="z-10 flex w-full max-w-sm flex-col gap-6">
        <Link
          href={"/"}
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src={"/logos/logo.svg"} alt="logo" width={30} height={30} />
          Cleenchat
        </Link>
        {children}
      </div>
    </div>
  );
};

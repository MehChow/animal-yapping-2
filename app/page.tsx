import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-white">
            Animal Yapping 2
          </h1>
          <p className="max-w-md text-lg leading-8 text-white">
            Welcome to Animal Yapping 2. Explore, connect, and discover!
          </p>
        </div>

        <div className="h-screen w-full bg-red-500">
          Temp content with h-screen height
        </div>

        <div className="h-screen w-full bg-red-500">
          Temp content with h-screen height
        </div>
      </main>
    </div>
  );
}

import Game from "@/components/Game";
import Link from "next/link";

export default function HomePage() {
  return (
    // <div className="space-y-4">
    //   <h1 className="text-2xl font-semibold">FormBuilder</h1>
    //   <p className="text-gray-700">
    //     Buat dan kelola form, lalu bagikan link untuk responden.
    //   </p>
    //   <Link href="/forms" className="underline">
    //     Go to Forms
    //   </Link>
    // </div>
    <main className="">
      <div className="">
        <Game />
      </div>
    </main>
  );
}
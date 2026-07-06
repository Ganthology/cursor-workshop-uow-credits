import { LookupForm } from "@/components/LookupForm";
import { CommunitySlides } from "@/components/CommunitySlides";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-xl font-medium tracking-tight">Cursor Credits</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email to retrieve your redeem link
        </p>
      </div>
      <LookupForm />
      <CommunitySlides />
    </main>
  );
}

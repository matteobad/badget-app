import { CreateAccountForm } from "./create-account-form";

export function ManualStep() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start">
        <h2 className="text-xl font-semibold">Create Account</h2>
        <p className="text-sm text-slate-500">Breve descrizione dello step</p>
      </header>

      <CreateAccountForm />
    </div>
  );
}

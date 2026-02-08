import { Shield } from 'lucide-react';

export function Branding() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-800">
        <Shield className="h-8 w-8 text-blue-600" />
        <span className="font-headline">Aarogyam</span>
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 font-headline">
        Your Health History, Securely Preserved.
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Manage prescriptions and medical records with India’s most trusted
        digital health locker.
      </p>
    </div>
  );
}

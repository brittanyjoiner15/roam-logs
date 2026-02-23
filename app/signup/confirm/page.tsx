import Link from 'next/link'

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-card shadow-card p-8 text-center">
        <p className="text-4xl mb-4">📬</p>
        <h1 className="text-2xl font-bold text-ink mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We sent a confirmation link to your inbox. Click it to activate your
          account and start logging your adventures.
        </p>
        <p className="text-sm text-gray-400">
          Already confirmed?{' '}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

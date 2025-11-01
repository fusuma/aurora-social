export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold text-red-600">Authentication Error</h2>
        <p className="text-center text-gray-600">
          There was a problem signing you in. Please try again.
        </p>
      </div>
    </div>
  );
}

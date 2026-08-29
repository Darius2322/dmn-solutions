export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">You don't have permission to view this page.</p>
    </main>
  );
}

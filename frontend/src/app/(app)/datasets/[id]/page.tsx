export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="font-display text-xl font-semibold text-text-primary">Dataset Detail</h1>
      <p className="text-sm text-text-muted mt-1 font-data">ID: {id}</p>
      <p className="text-sm text-text-muted mt-4">Full preview built in Milestone F5.</p>
    </div>
  );
}
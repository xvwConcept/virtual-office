import { useUsers } from '../../hooks/useUsers';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';
import { OfficeGrid } from './OfficeGrid';

export function OfficeView() {
  const { loading, error } = useUsers();
  useRealtimeStatus();

  if (loading) return <div className="p-8">Lade Büro …</div>;
  if (error) return <div className="p-8 text-red-400">Fehler: {error}</div>;

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">
        Virtual Office
      </h1>
      <OfficeGrid />
    </div>
  );
}

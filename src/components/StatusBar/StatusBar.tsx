import { useOfficeStore } from '../../stores/officeStore';
import { useUpdateStatus } from '../../hooks/useUpdateStatus';
import { STATUS_LABELS, STATUS_COLORS, type StatusValue } from '../../types';

const STATUSES: StatusValue[] = ['online', 'pause', 'dnd', 'offline'];

export function StatusBar() {
  const currentUserId = useOfficeStore((s) => s.currentUserId);
  const current = useOfficeStore((s) =>
    currentUserId ? s.statuses[currentUserId] : null
  );
  const updateStatus = useUpdateStatus();

  if (!currentUserId) return null;

  return (
    <div className="fixed bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-lg border border-white/10 bg-[var(--color-card)] p-2 shadow-xl">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => updateStatus(s)}
          className="flex items-center gap-2 rounded px-3 py-1 text-sm hover:bg-white/10"
          style={{
            outline:
              current?.status === s
                ? `2px solid ${STATUS_COLORS[s]}`
                : 'none',
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[s] }}
          />
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

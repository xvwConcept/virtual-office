import { useOfficeStore } from '../../stores/officeStore';
import { useUpdateStatus } from '../../hooks/useUpdateStatus';
import { useAuth } from '../../hooks/useAuth';
import { STATUS_LABELS, STATUS_COLORS, type StatusValue } from '../../types';
import { C } from '../Office/officeTokens';

const STATUSES: StatusValue[] = ['online', 'pause', 'dnd', 'offline'];

export function StatusBar() {
  const currentUserId = useOfficeStore((s) => s.currentUserId);
  const current = useOfficeStore((s) =>
    currentUserId ? s.statuses[currentUserId] : null
  );
  const updateStatus = useUpdateStatus();
  const { signOut } = useAuth();

  if (!currentUserId) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4,
      background: C.bgFrame,
      border: `1px solid ${C.wallLight}`,
      boxShadow: `0 4px 0 ${C.bgDeep}`,
      padding: '6px 8px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      zIndex: 100,
    }}>
      {STATUSES.map((s) => {
        const isActive = current?.status === s;
        const color = STATUS_COLORS[s];
        return (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 12px',
              background: isActive ? color + '22' : 'transparent',
              border: isActive ? `1px solid ${color}55` : '1px solid transparent',
              color: C.ink,
              fontFamily: 'inherit',
              fontSize: 11,
              letterSpacing: 1,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <span style={{
              width: 8, height: 8, background: color,
              boxShadow: isActive ? `0 0 8px ${color}` : 'none',
              display: 'block',
            }} />
            {STATUS_LABELS[s].toUpperCase()}
          </button>
        );
      })}

      <div style={{ width: 1, background: C.wallLight, margin: '4px 4px' }} />

      <button
        onClick={signOut}
        title="Abmelden"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          background: 'transparent',
          border: '1px solid transparent',
          color: C.inkDim,
          fontFamily: 'inherit',
          fontSize: 11,
          letterSpacing: 1,
          cursor: 'pointer',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = C.ink;
          (e.currentTarget as HTMLButtonElement).style.borderColor = C.wallLight;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = C.inkDim;
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
        }}
      >
        ⌐ LOGOUT
      </button>
    </div>
  );
}

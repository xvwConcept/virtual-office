import { useEffect } from 'react';
import { useOfficeStore } from '../../stores/officeStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../types';
import { C } from '../Office/officeTokens';

export function ToastStack() {
  const toasts     = useOfficeStore((s) => s.toasts);
  const removeToast = useOfficeStore((s) => s.removeToast);
  const users      = useOfficeStore((s) => s.users);

  useEffect(() => {
    if (toasts.length === 0) return;
    const newest = toasts[toasts.length - 1];
    const timer = setTimeout(() => removeToast(newest.id), 3200);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 200,
      pointerEvents: 'none',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }}>
      {toasts.slice(-4).map((t) => {
        const name = users[t.userId]?.name ?? '…';
        const toColor = STATUS_COLORS[t.to];
        return (
          <div
            key={t.id}
            className="toast-enter"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: C.bgFrame + 'f2',
              border: `1px solid ${toColor}55`,
              boxShadow: `0 3px 0 ${C.bgDeep}, 0 0 12px ${toColor}22`,
              fontSize: 11,
              letterSpacing: 0.5,
              color: C.ink,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 6, height: 6, background: toColor, boxShadow: `0 0 6px ${toColor}`, display: 'block', flexShrink: 0 }} />
            <span style={{ color: C.inkDim }}>{name}</span>
            <span style={{ color: C.inkSoft }}>→</span>
            <span style={{ color: toColor }}>{STATUS_LABELS[t.to].toUpperCase()}</span>
          </div>
        );
      })}
    </div>
  );
}

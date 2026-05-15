import { useEffect } from 'react';
import { useOfficeStore, type ToastEntry } from '../../stores/officeStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../types';
import { C } from '../Office/officeTokens';

// Each toast owns its dismiss timer — avoids the shared-timer bug where
// a new toast arriving would cancel the previous toast's timer.
function Toast({ toast, onRemove }: { toast: ToastEntry; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3200);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const toColor = STATUS_COLORS[toast.to];
  return (
    <div
      className="toast-enter"
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px',
        background: C.bgFrame + 'f2',
        border: `1px solid ${toColor}55`,
        boxShadow: `0 3px 0 ${C.bgDeep}, 0 0 12px ${toColor}22`,
        fontSize: 11, letterSpacing: 0.5,
        color: C.ink, whiteSpace: 'nowrap',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      <span style={{ width: 6, height: 6, background: toColor, boxShadow: `0 0 6px ${toColor}`, display: 'block', flexShrink: 0 }} />
      <span style={{ color: C.inkDim }}>{toast.userName}</span>
      <span style={{ color: C.inkSoft }}>→</span>
      <span style={{ color: toColor }}>{STATUS_LABELS[toast.to].toUpperCase()}</span>
    </div>
  );
}

export function ToastStack() {
  const toasts    = useOfficeStore((s) => s.toasts);
  const removeToast = useOfficeStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16,
      display: 'flex', flexDirection: 'column', gap: 6,
      zIndex: 200, pointerEvents: 'none',
    }}>
      {toasts.slice(-4).map((t) => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

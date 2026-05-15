import { useEffect, useRef, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOfficeStore } from './stores/officeStore';
import { OfficeView } from './components/Office/OfficeView';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Login } from './components/UI/Login';
import { ToastStack } from './components/UI/ToastStack';

function App() {
  const { ready, isPasswordRecovery } = useAuth();
  const currentUserId = useOfficeStore((s) => s.currentUserId);
  const prevUserId = useRef<string | null>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (currentUserId && !prevUserId.current) {
      setEntering(true);
      const t = setTimeout(() => setEntering(false), 900);
      prevUserId.current = currentUserId;
      return () => clearTimeout(t);
    }
    prevUserId.current = currentUserId;
  }, [currentUserId]);

  if (!ready) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: '#14121a',
      fontFamily: 'ui-monospace, monospace', color: '#f4ecd8', fontSize: 12,
    }}>
      …
    </div>
  );

  if (!currentUserId || isPasswordRecovery) return <Login />;

  return (
    <div className="app-shell">
      <div className={`app-office${entering ? ' office-enter' : ''}`}>
        <OfficeView />
      </div>
      <StatusBar />
      <ToastStack />
    </div>
  );
}

export default App;

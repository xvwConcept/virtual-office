import { useAuth } from './hooks/useAuth';
import { useOfficeStore } from './stores/officeStore';
import { OfficeView } from './components/Office/OfficeView';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Login } from './components/UI/Login';

function App() {
  const { ready } = useAuth();
  const currentUserId = useOfficeStore((s) => s.currentUserId);

  if (!ready) return <div className="p-8">Initialisiere …</div>;
  if (!currentUserId) return <Login />;

  return (
    <>
      <OfficeView />
      <StatusBar />
    </>
  );
}

export default App;

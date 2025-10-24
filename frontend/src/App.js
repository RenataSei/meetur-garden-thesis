import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import AppLayout from './components/AppLayout';

// Import your pages
import Home from './pages/Home';
import Plants from './pages/PlantsList';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <SidebarProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          {/* keep your other routes here */}
        </Routes>
      </AppLayout>
    </SidebarProvider>
  );
}

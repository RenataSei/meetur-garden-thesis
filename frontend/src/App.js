import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import AppLayout from './components/AppLayout';

// Pages
import Home from './pages/Home';
import Plants from './pages/PlantsList';
import NewPlant from './pages/NewPlant';
import EditPlant from './pages/EditPlant';
import PlantDetail from './pages/PlantDetail';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <SidebarProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/plants/new" element={<NewPlant />} />
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="/plants/:id/edit" element={<EditPlant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </SidebarProvider>
  );
}

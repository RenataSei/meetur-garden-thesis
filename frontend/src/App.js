import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import PlantsList from './pages/PlantsList';
import NewPlant from './pages/NewPlant';
import EditPlant from './pages/EditPlant';
import PlantDetail from './pages/PlantDetail';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/plants" element={<PlantsList />} />
        <Route path="/plants/new" element={<NewPlant />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/plants/:id/edit" element={<EditPlant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

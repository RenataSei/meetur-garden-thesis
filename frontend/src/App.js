import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PlantsList from './pages/PlantsList';
import NewPlant from './pages/NewPlant';
import EditPlant from './pages/EditPlant';
import PlantDetail from './pages/PlantDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plants" element={<PlantsList />} />
        <Route path="/plants/new" element={<NewPlant />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/plants/:id/edit" element={<EditPlant />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

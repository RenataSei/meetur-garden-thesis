import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import PlantsList from './pages/PlantsList';
import NewPlant from './pages/NewPlant';
import EditPlant from './pages/EditPlant';
import PlantDetail from './pages/PlantDetail';
import NotFound from './pages/NotFound';

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/plants" element={<PlantsList />} />
          <Route path="/plants/new" element={<NewPlant />} />
          <Route path="/plants/:id/edit" element={<EditPlant />} />
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

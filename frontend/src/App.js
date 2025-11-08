import { Route, Routes, BrowserRouter } from 'react-router-dom';

//Pages & Components
import Home from './pages/Home';

function App() {
  return (
    <div className="App">
     <BrowserRouter>
       <div className="pages">
         <Routes>
           <Route 
             path="/"
             element={<Home />}
             />
         </Routes>
       </div>
     </BrowserRouter>
    </div>
  );
}

export default App;
import './App.css';
import Admin from './components/Home/Admin';
import Home from './components/Home/Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Navigate to="/register" replace={true} />} />
          <Route exact path='/register' element={<Home />} />
          <Route exact path='/admin' element={<Admin/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

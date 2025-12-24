import React, { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext, AuthProvider } from "./context/AuthContext"; 
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login"/>;
};

const App = () => {
  return (
   <AuthProvider>
    <ThemeProvider>
      <BrowserRouter>
      <div className="app-layout">
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path='/' element={
            <PrivateRoute>
              <Navbar/>
              <Home/>
            </PrivateRoute>
          }/>
          <Route path='/chat' element={
            <PrivateRoute>
              <Navbar/>
              <Chat/>
            </PrivateRoute>
          }/>
          <Route path='/profile' element={
            <PrivateRoute>
              <Navbar/>
              <Profile/>
            </PrivateRoute>
          }/>
        </Routes>
      </div>
      </BrowserRouter>
    </ThemeProvider>
   </AuthProvider>
  );
};

export default App;


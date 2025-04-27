import React from 'react'
import LayOut from './Layout/LayOut'
import Home from './Home/Home'
import Login from './pages/login/Login'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <Routes>
      {/* Public route for Login */}
      <Route path="/" element={<Login />} />

      {/* Protected routes inside LayOut */}
      <Route path="/" element={<LayOut />}>
        <Route path="Dash" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App;

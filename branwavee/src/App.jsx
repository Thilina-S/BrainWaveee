import React from 'react'
import LayOut from './Layout/LayOut'
import Home from './Home/Home'
import Login from './pages/login/Login'
import { Route, Routes } from 'react-router-dom'

import MessageList from './Component/MessageList'
import ChatWindow from './Component/ChatWindow'

import { UserProfile } from './Home/UserProfile'


const App = () => {
  return (
    <Routes>
      {/* Public route for Login */}
      <Route path="/" element={<Login />} />

      {/* Protected routes inside LayOut */}
      <Route path="/" element={<LayOut />}>
        <Route path="Dash" element={<Home />} />

        <Route path="/messages" element={<MessageList />} />
        <Route path="/message/:userId" element={<ChatWindow />} />

        <Route path="profile"element={<UserProfile />} />

      </Route>
    </Routes>
  )
}

export default App;

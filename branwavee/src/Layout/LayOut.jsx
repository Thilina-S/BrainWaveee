import React from 'react'
import { Outlet } from 'react-router-dom'

export default function LayOut() {
  return (
    <>
      {/* Here you can add Navbar if you want */}
      <Outlet />
      {/* Footer or anything else */}
    </>
  )
}

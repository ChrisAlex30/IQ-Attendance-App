import React from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import './App.css'
import TDashboard from './pages/TDashboard'
import ADashboard from './pages/ADashboard'
import ViewDeleted from './pages/ViewDeleted'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/teacher' element={<TDashboard/>} />
        <Route path='/admin' element={<ADashboard/>} />
        <Route path='/deleted' element={<ViewDeleted/>} />
      </Routes>
    </Router>
  )
}

export default App

// Router Configuration

import Home from '@/pages/Home'
import Test from '@/pages/Test'
import NotFound from '@/pages/NotFound'
import Test2 from '@/pages/Test2'

import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/c/:id",
    element: <Home />
  },
  {
    path: "/test",
    element: <Test />
  },
  {
    path: "/test2",
    element: <Test2 />
  },
  {
    path: '*',
    element: <NotFound/>
  }
])

export default router
import { Routes, Route, useLocation } from "react-router-dom";
import UploadSong from "./pages/UploadSong";
import ListSong from "./pages/ListSong";
import SidebarAdmin from "./components/SidebarAdmin";
import Header from "./components/Header";
import Display from "./components/Display";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


  const App = () => {
    <ToastContainer position="top-right" autoClose={3000} />
  const location = useLocation();
  const adminPaths = ["/add-music", "/list-songs"];
  const isAdminPage = adminPaths.includes(location.pathname);

  return (
    <div className="flex relative h-screen">
      <ToastContainer/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

    
      
      {isAdminPage ? (
        <>
          <SidebarAdmin />
          <div className="flex-1 overflow-y-scroll">
            <Routes>
              <Route path="/add-music" element={<UploadSong />} />
              <Route path="/list-songs" element={<ListSong />} />
              <Router>
      <div className='flex'>
        <Sidebar />
        <Routes>
          <Route path="/list-songs" element={<ListSongs />} />
          {/* other routes */}
        </Routes>
      </div>
      </Router>
            </Routes>
          </div>
        </>
      ) : (
        <>
          <Sidebar />
          <div className="flex-1 bg-black overflow-y-scroll">
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <div className="text-white p-4">
                    Welcome to the music app!
                  </div>
                }
              />
            </Routes>
          </div>
          <div className="flex-2 bg-black hidden lg:block p-2">
            <Display />
          </div>
        </>
      )}
    </div>
  );
};

export default App;

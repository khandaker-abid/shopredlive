// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import { React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Welcome } from './components/welcome.js';
import { Login } from './components/login.js';
import { Register } from './components/register.js';
import { Profile } from './components/profile.js';

// let db = null
// await axios.get("http://127.0.0.1:8000/db")
// .then((res) => {
//     console.log(res.data)
//     setDB(res);
//     setPosts(res.data.posts);
// })
// .catch((err) => {
//     console.log("Request failed");
// });

function App() {

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<></>} /> 
          <Route path="/profile/:userId" element={<></>} />
          <Route path='/welcome' element={<Welcome />} />
          <Route path="*" element={<div>Page Doesn't Exist</div>} />
        </Routes>
      </div>
    </Router>
  );
}
// /app and /profile route are placeholders--in development

export default App;

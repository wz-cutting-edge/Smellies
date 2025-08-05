import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import CreatePost from "./routes/createPost";
import DetailedPost from "./routes/DetailedPost";
import EditPost from "./routes/EditPost";
import LoginPage from "./routes/loginPage";
import NavBar from "./components/NavBar";

const App = () =>{
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<DetailedPost />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}
export default App;

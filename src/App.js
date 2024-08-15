import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateRecord from "./page/CreateRecord";
import UpdateRecord from "./page/UpdateRecord";
import Home from "./page/Home";
import { Login } from "./page/Login";
import LandingPage from "./page/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="Home" element={<Home />} />
          <Route path="Create" element={<CreateRecord />} />
          <Route path="Update/:id" element={<UpdateRecord />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import Home from "./pages";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/error-page";

function Root() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}

export default App;

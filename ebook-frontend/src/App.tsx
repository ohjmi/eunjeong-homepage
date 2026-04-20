// import "./App.css";
// import Home from "./pages/Home";

// function App() {
//   return <Home />;
// }

// export default App;

import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EbookPage from "./pages/EbookPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ebook/:ebookId" element={<EbookPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

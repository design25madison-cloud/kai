import { createRoot } from "react-dom/client";
import BrandApp from "./app/BrandApp.jsx";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/utilities.css";
import "./styles/flow.css";
import "./styles/results.css";

createRoot(document.getElementById("root")).render(<BrandApp />);

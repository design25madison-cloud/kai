import { createRoot } from "react-dom/client";
import BrandApp from "./app/BrandApp.jsx";
import accounts from "./app/store.js";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/utilities.css";
import "./styles/flow.css";
import "./styles/mockups.css";
import "./styles/results.css";
import "./styles/onboarding.css";
import "./styles/account.css";

const root = document.getElementById("root");
// The hosted version asks the server who is signed in before the first render.
Promise.resolve(accounts.init && accounts.init())
  .then(() => createRoot(root).render(<BrandApp />))
  .catch((err) => { root.textContent = err.message; });

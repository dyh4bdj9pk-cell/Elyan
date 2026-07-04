// Preview entry — mounts the real App with a localStorage-backed window.storage
// shim and a little demo data so the design shows populated. This bundle is for
// the standalone preview only; the production site runs inside the Claude artifact.
import { createRoot } from "react-dom/client";
import { jsx } from "react/jsx-runtime";
import App from "../App.jsx";

createRoot(document.getElementById("root")).render(jsx(App, {}));

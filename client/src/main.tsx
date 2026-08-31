// Import necessary modules from React and React Router
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

/* ************************************************************************* */

// Import the main app component
import Home from "@/pages/Home/Home";
import Incident from "@/pages/Incident/Incident";
import Profile from "@/pages/Profile/Profile";
import Numbers from "@/pages/Numbers/Numbers";
import Details from "@/pages/Details/Details";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import App from "@/App";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/numbers",
        element: <Numbers />,
      },
      {
        path: "/incident",
        element: <Incident />,
      },
      {
        path: "/incident/:id",
        element: <Details />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

/* ************************************************************************* */

// Find the root element in the HTML document
const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

// Render the app inside the root element
createRoot(rootElement).render(<RouterProvider router={router} />);

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import DashboardPage from "@/pages/DashboardPage";
import CampaignsPage from "@/pages/CampaignsPage";
import RCampaignsPage from "@/pages/RCampaignsPage";
import UserAndGroupPage from "@/pages/UserAndGroupPage";
import EmailTemplatesPage from "@/pages/EmailTemplatesPage";
import LandingPage from "@/pages/LandingPage";
import SendingProfilesPage from "@/pages/SendingProfilesPage";
import UserManagementPage from "@/pages/UserManagementPage";
import LoginPage from "@/pages/LoginPage";

import UDashboardPage from "@/pages/uPages/UDashboardPage";
import UCampaignsPage from "@/pages/uPages/UCampaignsPage";
import URCampaignsPage from "@/pages/uPages/URCampaignsPage";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/campaigns",
    element: <CampaignsPage />,
  },
  {
    path: "/campaigns/id",
    element: <RCampaignsPage />,
  },
  {
    path: "/user-and-group",
    element: <UserAndGroupPage />,
  },
  {
    path: "/email-templates",
    element: <EmailTemplatesPage />,
  },
  {
    path: "/landing-pages",
    element: <LandingPage />,
  },
  {
    path: "/sending-profiles",
    element: <SendingProfilesPage />,
  },
  {
    path: "/user-management",
    element: <UserManagementPage />,
  },
  {
    path: "/u/dashboard",
    element: <UDashboardPage />
  },
  {
    path: "/u/campaigns",
    element: <UCampaignsPage />
  },
  {
    path: "/u/campaigns/id",
    element: <URCampaignsPage />
  }
]);

export default function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

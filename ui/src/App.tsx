import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SelecaoPage from "./pages/SelecaoPage";
import ParlamentarDashboard from "./pages/ParlamentarDashboard";
import DashboardPage from "./pages/DashboardPage";
import PesquisaIAPage from "./pages/PesquisaIAPage";
import NotFound from "./pages/NotFound";
import { useGhostAuth } from "@/components/auth/ghost-auth/react/useGhostAuth";

const queryClient = new QueryClient();

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

// Keeps path comparisons stable for `/app` and `/app/`.
const normalizePath = (path: string) => {
  const normalized = path.replace(/\/+$/, "");
  return normalized === "" ? "/" : normalized;
};

const initialPathname =
  typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/";

const initialBasePath = normalizePath(routerBasename ?? "/");

const shouldCheckInitialRootRedirect = initialPathname === initialBasePath;

let hasHandledInitialRootRoute = false;

function shouldRunInitialRootRedirect(token: string | null) {
  return (
    !hasHandledInitialRootRoute &&
    shouldCheckInitialRootRedirect &&
    Boolean(token)
  );
}

function markInitialRootRouteAsHandled() {
  // Redirect should be evaluated only once, during the very first root render.
  hasHandledInitialRootRoute = true;
}

function RootRoute() {
  const token = useGhostAuth();
  const shouldRedirectNow = shouldRunInitialRootRedirect(token);
  markInitialRootRouteAsHandled();

  if (shouldRedirectNow) {
    return <Navigate to="/selecao" replace />;
  }

  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/selecao" element={<SelecaoPage />} />
          <Route path="/parlamentar/:id" element={<ParlamentarDashboard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pesquisa" element={<PesquisaIAPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

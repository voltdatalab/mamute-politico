import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SelecaoPage from "./pages/SelecaoPage";
import ParlamentarDashboard from "./pages/ParlamentarDashboard";
import DashboardPage from "./pages/DashboardPage";
import PesquisaIAPage from "./pages/PesquisaIAPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<Index />} />
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

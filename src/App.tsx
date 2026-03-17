import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "@/context/SocketContext";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import BoardSetupPage from "./pages/BoardSetupPage";
import CharacterSelectPage from "./pages/CharacterSelectPage";
import GameBoardPage from "./pages/GameBoardPage";
import GameOverPage from "./pages/GameOverPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/setup" element={<BoardSetupPage />} />
            <Route path="/select" element={<CharacterSelectPage />} />
            <Route path="/game" element={<GameBoardPage />} />
            <Route path="/gameover" element={<GameOverPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

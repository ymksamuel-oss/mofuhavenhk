import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Products from "@/pages/Products";
import InfoPage from "@/pages/InfoPage";

function AboutPage() { return <InfoPage page="about" />; }
function FaqPage() { return <InfoPage page="faq" />; }
function ShippingPolicyPage() { return <InfoPage page="shipping-policy" />; }
function ReturnsPolicyPage() { return <InfoPage page="returns-policy" />; }
function PrivacyPolicyPage() { return <InfoPage page="privacy-policy" />; }

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/products"} component={Products} />
      <Route path={"/about"} component={AboutPage} />
      <Route path={"/faq"} component={FaqPage} />
      <Route path={"/shipping-policy"} component={ShippingPolicyPage} />
      <Route path={"/returns-policy"} component={ReturnsPolicyPage} />
      <Route path={"/privacy-policy"} component={PrivacyPolicyPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

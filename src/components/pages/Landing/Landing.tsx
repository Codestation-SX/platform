import Divider from "@mui/material/Divider";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { backofficeTheme } from "@/theme/backofficeTheme";
import AppAppBar from "@/components/core/StyledAppBar";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <ThemeProvider theme={backofficeTheme}>
      <CssBaseline />
      <div className="backoffice-shell">
        <AppAppBar />
        <Hero />
        <div>
          <Testimonials />
          <Divider />
          <Highlights />
          <Divider />
          <FAQ />
          <Divider />
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}

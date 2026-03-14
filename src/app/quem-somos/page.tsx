"use client";
import Divider from "@mui/material/Divider";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { backofficeTheme } from "@/theme/backofficeTheme";
import Footer from "@/components/pages/Landing/components/Footer";
import Hero from "./components/Hero";
import OurStory from "./components/OurStory";
import Milestones from "./components/Milestones";
import Values from "./components/Values";
import AppAppBar from "@/components/core/StyledAppBar";
import Testimonials from "@/components/pages/Landing/components/Testimonials";
import FAQ from "@/components/pages/Landing/components/FAQ";

export default function AboutPage() {
  return (
    <ThemeProvider theme={backofficeTheme}>
      <CssBaseline />
      <div className="backoffice-shell">
        <AppAppBar />
        <Hero />
        <div>
          <OurStory />
          <Divider />
          <Milestones />
          <Divider />
          <Values />
          <Divider />
          <Testimonials />
          <Divider />
          <FAQ />
          <Divider />
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}

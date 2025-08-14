import Divider from "@mui/material/Divider";
import AppAppBar from "@/components/core/StyledAppBar";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <>
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
    </>
  );
}

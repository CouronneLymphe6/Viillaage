import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Roles from "@/components/Roles";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";


export default function Home() {
  return (

    <main>
      <Navbar />
      <Hero />
      <Features />
      <Roles />
      <Pricing />
      <Footer />
    </main>
  );
}

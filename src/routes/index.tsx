import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/site/Nav";
import { About, Contact, Footer, Gallery, Hero, Reviews, Services, Team, WhatsAppFab } from "@/components/site/Sections";
import { Booking } from "@/components/site/Booking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BLACK BLADE — Premium Barbershop in Amman" },
      { name: "description", content: "Precision cuts, skin fades, beard sculpting and royal shaves. Book your chair at BLACK BLADE online." },
      { property: "og:title", content: "BLACK BLADE — Premium Barbershop" },
      { property: "og:description", content: "Precision cuts, fades and royal shaves. Book online in seconds." },
    ],
  }),
  component: Index,
});

function Index() {
  const [service, setService] = useState("");
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Services
        onPick={(id) => {
          setService(id);
          document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <Gallery />
      <Team />
      <Reviews />
      <Booking service={service} setService={setService} />
      <Contact />
      <Footer />
      <WhatsAppFab />
    </main>
  );
}

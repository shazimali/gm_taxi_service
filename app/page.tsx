import HeroSection from '@/components/home/HeroSection';
import AirportTransfers from '@/components/home/AirportTransfers';
import ServicesGrid from '@/components/home/ServicesGrid';
import FleetSection from '@/components/home/FleetSection';
import MediaShowcase from '@/components/home/MediaShowcase';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import StatsBar from '@/components/home/StatsBar';
import Testimonials from '@/components/home/Testimonials';
import BookingSteps from '@/components/home/BookingSteps';
import FAQAccordion from '@/components/home/FAQAccordion';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <hr className="section-divider" aria-hidden="true" />

      <AirportTransfers />
      <hr className="section-divider" aria-hidden="true" />

      <ServicesGrid />
      <hr className="section-divider" aria-hidden="true" />

      <FleetSection />
      <hr className="section-divider" aria-hidden="true" />

      <MediaShowcase />
      <hr className="section-divider" aria-hidden="true" />

      <WhyChooseUs />
      <hr className="section-divider" aria-hidden="true" />

      <StatsBar />
      <hr className="section-divider" aria-hidden="true" />

      <Testimonials />
      <hr className="section-divider" aria-hidden="true" />

      <BookingSteps />
      <hr className="section-divider" aria-hidden="true" />

      <FAQAccordion />
    </>
  );
}

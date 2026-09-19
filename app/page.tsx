import BookingSteps from '@/components/home/BookingSteps';
import FAQAccordion from '@/components/home/FAQAccordion';
import FleetSection from '@/components/home/FleetSection';
import HeroSection from '@/components/home/HeroSection';
import ServicesGrid from '@/components/home/ServicesGrid';
import StatsBar from '@/components/home/StatsBar';
import Testimonials from '@/components/home/Testimonials';
import WhyChooseUs from '@/components/home/WhyChooseUs';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <hr className="section-divider" aria-hidden="true" />

      <ServicesGrid />
      <hr className="section-divider" aria-hidden="true" />

      <FleetSection />
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

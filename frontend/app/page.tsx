import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryNav from '@/components/CategoryNav';
import FeaturedCollections from '@/components/FeaturedCollections';
import ProductShowcase from '@/components/ProductShowcase';
import NewArrivals from '@/components/NewArrivals';
import BrandStory from '@/components/BrandStory';
import Benefits from '@/components/Benefits';
import ClientCarousel from '@/components/ClientCarousel';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';

const testimonials = [
  {
    author: {
      name: "Priya Sharma",
      handle: "@priyahome",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "The quality of furniture from Uflix is exceptional. Our living room transformation exceeded all expectations. Highly recommend!"
  },
  {
    author: {
      name: "Rahul Mehta",
      handle: "@rahulinteriors",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "Fast delivery and excellent customer service. The dining set we ordered arrived perfectly packaged and assembly was a breeze."
  },
  {
    author: {
      name: "Anjali Patel",
      handle: "@anjalidesign",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "Best furniture shopping experience online. The product photos match exactly what we received. Very satisfied with our bedroom set!"
  },
  {
    author: {
      name: "Vikram Singh",
      handle: "@vikramhomes",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    text: "Uflix has transformed our office space. The ergonomic chairs and desks have improved our team's productivity significantly."
  },
  {
    author: {
      name: "Neha Kapoor",
      handle: "@nehalifestyle",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    text: "The attention to detail in every piece is remarkable. Our guests always compliment the beautiful furniture from Uflix."
  },
  {
    author: {
      name: "Arjun Reddy",
      handle: "@arjunspaces",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    },
    text: "Great value for money! The discounts are genuine and the quality is top-notch. Will definitely shop here again."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="homepage-main">
        <Hero />
        <ClientCarousel />
        <CategoryNav />
        <FeaturedCollections />
        <ProductShowcase />
        <NewArrivals />
        <TestimonialsSection
          title="Loved by Thousands of Happy Customers"
          description="See what our customers have to say about their Uflix furniture experience"
          testimonials={testimonials}
        />
        <BrandStory />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
}

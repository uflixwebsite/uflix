'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';


interface HeroProps {
  slides?: Array<{
    image: string;
    title: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    titleColor?: string;
    subtitleColor?: string;
    primaryButtonBg?: string;
    primaryButtonTextColor?: string;
    secondaryButtonBg?: string;
    secondaryButtonTextColor?: string;
  }>;
}

type HeroSlide = {
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  titleColor?: string;
  subtitleColor?: string;
  primaryButtonBg?: string;
  primaryButtonTextColor?: string;
  secondaryButtonBg?: string;
  secondaryButtonTextColor?: string;
};

const PLACEHOLDER_SLIDE: HeroSlide = {
  image: '',
  title: 'Your Hero Title Here',
  subtitle: 'Add hero slides from the admin panel',
  buttonText: 'Shop Now',
  buttonLink: '/shop',
  titleColor: '',
  subtitleColor: '',
  primaryButtonBg: '',
  primaryButtonTextColor: '',
  secondaryButtonBg: '',
  secondaryButtonTextColor: '',
};

export default function Hero({ slides: propSlides }: HeroProps) {
  const slides = propSlides && propSlides.length > 0 ? propSlides : [PLACEHOLDER_SLIDE];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[70vh] sm:h-[85vh] lg:h-screen min-h-150 bg-foreground overflow-hidden">

      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-foreground/70 to-foreground/30" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight" style={{ color: slides[currentSlide].titleColor || undefined }}>
              {slides[currentSlide].title}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed" style={{ color: slides[currentSlide].subtitleColor || undefined }}>
              {slides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href={slides[currentSlide].buttonLink || '/shop'}
                className="btn-primary px-6 sm:px-8 py-3 rounded-md font-semibold transition-colors text-center"
                style={{ backgroundColor: slides[currentSlide].primaryButtonBg || undefined, color: slides[currentSlide].primaryButtonTextColor || undefined }}
              >
                {slides[currentSlide].buttonText || 'Shop Now'}
              </Link>
              <Link
                href="/categories"
                className="bg-white hover:bg-neutral-light text-foreground px-6 sm:px-8 py-3 rounded-md font-semibold transition-colors text-center"
                style={{ backgroundColor: slides[currentSlide].secondaryButtonBg || undefined, color: slides[currentSlide].secondaryButtonTextColor || undefined }}
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

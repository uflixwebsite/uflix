'use client';

import { SignIn } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="auth-page-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-accent hover:bg-secondary',
                card: 'shadow-lg',
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

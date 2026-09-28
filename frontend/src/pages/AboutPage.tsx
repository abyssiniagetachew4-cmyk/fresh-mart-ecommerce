
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBasket,
  CheckCircle2,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient text-primary-foreground py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/15 text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Freshness You Can Trust
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About FreshMart
              </h1>

              <p className="text-lg md:text-xl leading-relaxed opacity-90 max-w-2xl mx-auto">
                Making everyday grocery shopping simpler, more convenient,
                and accessible by bringing quality products closer to you.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Visual */}
              <div className="relative">
                <div className="rounded-3xl bg-primary/10 p-8 md:p-12">
                  <div className="aspect-square max-w-md mx-auto rounded-2xl bg-card border shadow-soft flex items-center justify-center">
                    <div className="text-center p-8">
                      <ShoppingBasket className="w-20 h-20 text-primary mx-auto mb-6" />

                      <h3 className="text-2xl font-bold mb-3">
                        FreshMart
                      </h3>

                      <p className="text-muted-foreground">
                        Fresh groceries. Simple shopping.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -right-3 md:right-6 bg-card border rounded-2xl shadow-lg px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Quality First</p>
                      <p className="text-xs text-muted-foreground">
                        Everyday essentials
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                  Our Story
                </span>

                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                  Grocery shopping made easier
                </h2>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    FreshMart is an online grocery platform designed to make
                    everyday shopping convenient and straightforward.
                  </p>

                  <p>
                    Instead of spending time searching through different
                    stores, customers can browse a variety of grocery
                    products in one place, add what they need to their cart,
                    and place an order online.
                  </p>

                  <p>
                    From fresh fruits and vegetables to dairy products,
                    beverages, bakery items, meat, and seafood, FreshMart
                    brings everyday essentials together in one simple
                    shopping experience.
                  </p>
                </div>

                <div className="mt-8">
                  <Link to="/products">
                    <Button size="lg">
                      Start Shopping
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Why FreshMart
              </span>

              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                Built around your everyday needs
              </h2>

              <p className="text-muted-foreground">
                We focus on making grocery shopping convenient while keeping
                quality and customer experience at the center.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Card 1 */}
              <div className="group bg-card border rounded-2xl p-6 hover:shadow-soft transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  Fresh Products
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  A selection of everyday grocery products for your home and
                  family.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group bg-card border rounded-2xl p-6 hover:shadow-soft transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  Convenient Shopping
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Browse and order your groceries online without unnecessary
                  trips to the store.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group bg-card border rounded-2xl p-6 hover:shadow-soft transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  Secure Experience
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Designed with secure authentication, ordering, and payment
                  workflows.
                </p>
              </div>

              {/* Card 4 */}
              <div className="group bg-card border rounded-2xl p-6 hover:shadow-soft transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Heart className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  Customer Focus
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  A simple shopping experience designed with customers in
                  mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                    Everything in One Place
                  </span>

                  <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                    From fresh produce to everyday essentials
                  </h2>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    FreshMart brings different grocery categories together so
                    you can find what you need quickly and conveniently.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Fresh Fruits',
                      'Vegetables',
                      'Dairy & Eggs',
                      'Beverages',
                      'Bakery',
                      'Meat & Seafood',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border rounded-3xl p-8 md:p-10">
                  <div className="text-center">
                    <ShoppingBasket className="w-16 h-16 text-primary mx-auto mb-5" />

                    <h3 className="text-2xl font-bold mb-3">
                      Ready to shop?
                    </h3>

                    <p className="text-muted-foreground mb-6">
                      Explore our products and find everything you need for
                      your next grocery trip.
                    </p>

                    <Link to="/products">
                      <Button>
                        Browse Products
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
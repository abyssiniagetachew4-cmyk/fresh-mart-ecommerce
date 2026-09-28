
import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  try {
    const response = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send message");
    }

    setSubmitted(true);
    form.reset();
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Sorry, your message could not be sent. Please try again.");
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient text-primary-foreground py-20 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/15 text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              We're Here to Help
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
              Contact Us
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl opacity-90 leading-relaxed">
              Have a question about your order or our products?
              Send us a message and we'll be happy to help.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
              
              {/* Contact Information */}
              <div className="lg:col-span-2">
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                  Get in Touch
                </span>

                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                  We'd love to hear from you
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  Whether you have a question, need help with an order, or
                  want to share feedback, you can reach the FreshMart team
                  through the information below.
                </p>

                <div className="space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card hover:shadow-soft transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">
                        Email
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        info@freshmart.com
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card hover:shadow-soft transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">
                        Phone
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        +251 900 000 000
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card hover:shadow-soft transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">
                        Location
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Addis Ababa, Ethiopia
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card hover:shadow-soft transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">
                        Customer Support
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Monday – Saturday
                      </p>
                      <p className="text-sm text-muted-foreground">
                        8:00 AM – 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-soft">
                  {submitted ? (
                    <div className="min-h-[450px] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        Thank You!
                      </h2>

                      <p className="text-muted-foreground max-w-md leading-relaxed mb-8">
                        Your message has been received. Our team will get
                        back to you as soon as possible.
                      </p>

                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-7">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">
                          Send Us a Message
                        </h2>

                        <p className="text-muted-foreground">
                          Fill out the form below and we'll get back to you.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-2"
                          >
                            Your Name
                          </label>

                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            required
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                          >
                            Email Address
                          </label>

                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-sm font-medium mb-2"
                          >
                            Subject
                          </label>

                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="What can we help you with?"
                            required
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium mb-2"
                          >
                            Message
                          </label>

                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Write your message here..."
                            rows={6}
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                        >
                          Send Message
                          <Send className="ml-2 w-4 h-4" />
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          We aim to respond to customer inquiries as quickly
                          as possible.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 bg-secondary/30 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Looking for something specific?
            </h2>

            <p className="text-muted-foreground mb-6">
              Browse our products and discover what FreshMart has to offer.
            </p>

            <a href="/products">
              <Button variant="outline">
                Browse Products
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;

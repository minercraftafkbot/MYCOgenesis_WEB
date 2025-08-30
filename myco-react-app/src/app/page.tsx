'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProductCatalog } from '../hooks/useProductCatalog';
import useBlogPosts from '../hooks/useBlogPosts';
import ProductPreview from '../components/ProductPreview';
import BlogPostPreview from '../components/BlogPostPreview';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const heroImages = [
  '/images/hero_section/Gemini_Generated_Image_64xcrz64xcrz64xc.png',
  '/images/hero_section/Gemini_Generated_Image_iybqagiybqagiybq.png',
  '/images/hero_section/Gemini_Generated_Image_ynjdvcynjdvcynjd.png',
];

export default function HomePage() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const { products: featuredProducts } = useProductCatalog({
    isFeatured: true,
    limit: 3,
    filterByAvailability: true
  });
  const { posts: blogPosts } = useBlogPosts({ limit: 3 });

  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    if (!formState.name || !formState.email || !formState.message) {
      alert('Please fill out all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'contact-inquiries'), {
        ...formState,
        submittedAt: serverTimestamp(),
        status: 'new',
      });
      setSubmitStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main>
      {/* Hero Section */}
      <section id="home" className="hero-bg text-white">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`hero-bg-image ${index === currentBgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          ></div>
        ))}
        <div className="bg-black/60 min-h-[60vh] md:min-h-[70vh] flex items-center relative z-10">
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight hero-title">
              Cultivating Tomorrow&apos; s Flavors, Today
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto hero-description">
              Harnessing nature&apos;s intelligence and modern technology for superior quality, sustainable, and diverse mushroom varieties.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link href="#mushrooms" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg text-center">
                Explore Our Mushrooms
              </Link>
              <Link href="#smart-farm" className="w-full sm:w-auto bg-stone-200 hover:bg-stone-300 text-slate-800 font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg text-center">
                Our Technology
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center p-6 rounded-xl hover:bg-stone-50/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-slate-800">Precision Climate Control</h3>
              <p className="text-slate-600 leading-relaxed">IoT and AI-driven systems ensure optimal growing conditions 24/7, mimicking nature perfectly.</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:bg-stone-50/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-slate-800">Unmatched Quality</h3>
              <p className="text-slate-600 leading-relaxed">Consistently perfect mushrooms, harvested at their peak, from our living farm to your table.</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:bg-stone-50/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m0 0a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-slate-800">Sustainable Practices</h3>
              <p className="text-slate-600 leading-relaxed">Minimizing our footprint with resource-efficient, circular economy methods that honor the earth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-16 sm:py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Our Featured Varieties</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover our premium selection of gourmet mushrooms, cultivated with precision and care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map(product => (
              <ProductPreview key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-800">The Art and Science of Fungi</h2>
              <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                MYCOgenesis was born from a passion for sustainable agriculture and a fascination with the untapped potential of fungi. Our mission is to blend age-old cultivation wisdom with cutting-edge technology to produce mushrooms of unparalleled quality and consistency.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We believe in a future where food production is both smart and sustainable. By creating the perfect, climate-controlled environment, we not only grow exceptional mushrooms but also contribute to a circular economy, turning agricultural waste into a source of wealth and nutrition.
              </p>
              <Link href="/about" className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-md">
                Learn More About Us
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative p-4">
                <Image
                  src="/images/home_page/oyster_hand_holding_substrate.png"
                  alt="Hands holding mushroom substrate"
                  className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  width={600}
                  height={400}
                />
                <div className="absolute inset-4 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mushrooms Section */}
      <section id="mushrooms" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-800">Explore Our Varieties</h2>
          <div className="space-y-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Image src="/images/home_page/portabelo_on_cuttingtale.png" alt="Portobello Mushrooms" className="rounded-lg shadow-lg w-full" width={600} height={400} />
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">Button, Cremini & Portobello</h3>
                <p className="text-slate-600 mb-4">These are all the same mushroom (Agaricus bisporus) at different stages of maturity. From the mild, familiar white button to the slightly richer cremini and the large, meaty portobello, they are the versatile workhorses of the culinary world.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-2">
                <Image src="/images/home_page/oyster_on_the table.png" alt="Oyster Mushrooms" className="rounded-lg shadow-lg w-full" width={600} height={400} />
              </div>
              <div className="md:order-1">
                <h3 className="text-2xl font-bold mb-3 text-slate-800 ">Oyster Mushrooms</h3>
                <p className="text-slate-600 mb-4">Named for their fan-like shape, Oyster mushrooms (Pleurotus ostreatus) come in a stunning array of colors like blue, gold, and pink. They are easy to cultivate and have a delicate, mild flavor perfect for a variety of dishes.</p>
              </div>
            </div>
          </div>
          <div className="mt-20 p-6 bg-amber-100/50 border-l-4 border-amber-500 text-amber-800 rounded-md">
            <p className="font-bold">Important Disclaimer:</p>
            <p>MYCOgenesis is dedicated to cultivating culinary and medicinal mushroom varieties. We do not cultivate, sell, or distribute psilocybin-containing mushrooms, which are classified as a Schedule 1 drug and are subject to legal restrictions.</p>
          </div>
        </div>
      </section>

      {/* Our Smart Farm Section */}
      <section id="smart-farm" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-800 ">Technology Inspired by Nature</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 ">The IoT Solution</h3>
              <p className="text-slate-600 mb-4">We&apos;ve moved beyond the inconsistencies of traditional farming. Our farm is powered by an Internet of Things (IoT) ecosystem that provides real-time monitoring and automated control over every aspect of the cultivation environment.</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Sensors:</strong> High-precision sensors continuously track temperature, humidity, CO₂, and light.</li>
                <li><strong>Actuators:</strong> The system automatically adjusts conditions using fans, misters, and heaters.</li>
                <li><strong>Remote Monitoring:</strong> All data is streamed to a cloud dashboard, for management from anywhere, anytime.</li>
              </ul>
            </div>
            <div className="p-4">
              <div className="relative">
                <Image
                  src="/images/home_page/lab_image.png"
                  alt="Modern laboratory with advanced mushroom cultivation technology"
                  className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  width={600}
                  height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8 text-center text-slate-800">AI Integration & Sustainability</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-stone-100 p-8 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-slate-800">Predictive Analytics</h4>
                <p className="text-slate-600">Our AI models analyze data to predict optimal harvest times and proactively adjust environmental controls, ensuring peak quality and yield.</p>
              </div>
              <div className="bg-stone-100 p-8 rounded-lg text-slate-800">
                <h4 className="font-bold text-lg mb-2">Circular Economy</h4>
                <p className="text-slate-600">We utilize agricultural waste like sawdust and rice bran as our growing substrate, reducing our carbon footprint and turning waste into wealth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-16 sm:py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Shop Our Products</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From fresh gourmet mushrooms to cultivation kits, find everything you need for your mycological journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map(product => (
              <ProductPreview key={product._id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/shop" className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              View All Products
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">From the Blog</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay updated with our latest research, discoveries, and industry insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {blogPosts.slice(0, 3).map(post => (
              <BlogPostPreview key={post._id} post={post} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/blog" className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              View All Articles
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Get In Touch</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions about our mushrooms or technology? We&apos;d love to hear from you.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-slate-700 font-medium mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white/50"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white/50"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-slate-700 font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formState.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                    placeholder="Tell us about your project or ask us anything..."
                    required
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Message'}
                  </button>
                </div>
              </form>
              {submitStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-center font-medium">Thank you for your message! We&apos;ll get back to you soon.</p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-center font-medium">Something went wrong. Please try again later.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

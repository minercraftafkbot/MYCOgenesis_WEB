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
              Cultivating Tomorrow's Flavors, Today
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto hero-description">
              Harnessing nature's intelligence and modern technology for superior quality, sustainable, and diverse mushroom varieties.
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6">
                <h3 className="font-bold text-xl mb-2">Precision Climate Control</h3>
                <p className="text-slate-600">IoT and AI-driven systems ensure optimal growing conditions 24/7, mimicking nature perfectly.</p>
            </div>
            <div className="p-6">
                <h3 className="font-bold text-xl mb-2">Unmatched Quality</h3>
                <p className="text-slate-600">Consistently perfect mushrooms, harvested at their peak, from our living farm to your table.</p>
            </div>
            <div className="p-6">
                <h3 className="font-bold text-xl mb-2">Sustainable Practices</h3>
                <p className="text-slate-600">Minimizing our footprint with resource-efficient, circular economy methods that honor the earth.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section id="featured-products" className="py-20">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Featured Varieties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map(product => (
                    <ProductPreview key={product._id} product={product} />
                ))}
            </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                      <h2 className="text-3xl font-bold mb-4">The Art and Science of Fungi</h2>
                      <p className="text-slate-600 mb-4 text-lg">MYCOgenesis was born from a passion for sustainable agriculture and a fascination with the untapped potential of fungi. Our mission is to blend age-old cultivation wisdom with cutting-edge technology to produce mushrooms of unparalleled quality and consistency.</p>
                      <p className="text-slate-600">We believe in a future where food production is both smart and sustainable. By creating the perfect, climate-controlled environment, we not only grow exceptional mushrooms but also contribute to a circular economy, turning agricultural waste into a source of wealth and nutrition.</p>
                  </div>
                  <div>
                      <Image src="/images/home_page/oyster_hand_holding_substrate.png" alt="Hands holding mushroom substrate" className="rounded-lg shadow-xl" width={600} height={400}/>
                  </div>
              </div>
          </div>
      </section>
      
      {/* Our Mushrooms Section */}
      <section id="mushrooms" className="py-20">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Explore Our Varieties</h2>
            <div className="space-y-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <Image src="/images/home_page/portabelo_on_cuttingtale.png" alt="Portobello Mushrooms" className="rounded-lg shadow-lg w-full" width={600} height={400}/>
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Button, Cremini & Portobello</h3>
                        <p className="text-slate-600 mb-4">These are all the same mushroom (Agaricus bisporus) at different stages of maturity. From the mild, familiar white button to the slightly richer cremini and the large, meaty portobello, they are the versatile workhorses of the culinary world.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="md:order-2">
                        <Image src="/images/home_page/oyster_on_the table.png" alt="Oyster Mushrooms" className="rounded-lg shadow-lg w-full" width={600} height={400}/>
                    </div>
                    <div className="md:order-1">
                        <h3 className="text-2xl font-bold mb-3">Oyster Mushrooms</h3>
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
            <h2 className="text-3xl font-bold text-center mb-16">Technology Inspired by Nature</h2>
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h3 className="text-2xl font-bold mb-4">The IoT Solution</h3>
                    <p className="text-slate-600 mb-4">We've moved beyond the inconsistencies of traditional farming. Our farm is powered by an Internet of Things (IoT) ecosystem that provides real-time monitoring and automated control over every aspect of the cultivation environment.</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-2">
                        <li><strong>Sensors:</strong> High-precision sensors continuously track temperature, humidity, CO₂, and light.</li>
                        <li><strong>Actuators:</strong> The system automatically adjusts conditions using fans, misters, and heaters.</li>
                        <li><strong>Remote Monitoring:</strong> All data is streamed to a cloud dashboard, for management from anywhere, anytime.</li>
                    </ul>
                </div>
                <div>
                    <Image src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" alt="Scientist with tablet in a modern farm" className="rounded-lg shadow-xl" width={600} height={400}/>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold mb-8 text-center">AI Integration & Sustainability</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-stone-100 p-8 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Predictive Analytics</h4>
                        <p className="text-slate-600">Our AI models analyze data to predict optimal harvest times and proactively adjust environmental controls, ensuring peak quality and yield.</p>
                    </div>
                    <div className="bg-stone-100 p-8 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Circular Economy</h4>
                        <p className="text-slate-600">We utilize agricultural waste like sawdust and rice bran as our growing substrate, reducing our carbon footprint and turning waste into wealth.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-20">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Shop Our Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map(product => (
                    <ProductPreview key={product._id} product={product} />
                ))}
            </div>
            <div className="text-center mt-12">
                <Link href="/business" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                    View All Products
                </Link>
            </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">From the Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogPosts.slice(0, 3).map(post => (
                    <BlogPostPreview key={post._id} post={post} />
                ))}
            </div>
            <div className="text-center">
                <Link href="/blog" className="mt-12 inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg">
                    View All Articles
                </Link>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-stone-100">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-slate-700 font-bold mb-2">Name</label>
                        <input type="text" id="name" value={formState.name} onChange={handleInputChange} className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Your Name" required/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-slate-700 font-bold mb-2">Email</label>
                        <input type="email" id="email" value={formState.email} onChange={handleInputChange} className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="your.email@example.com" required/>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="message" className="block text-slate-700 font-bold mb-2">Message</label>
                        <textarea id="message" rows={5} value={formState.message} onChange={handleInputChange} className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Your message..." required></textarea>
                    </div>
                    <div className="text-center">
                        <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
                {submitStatus === 'success' && (
                    <p className="mt-4 text-center text-green-600 bg-green-100 p-3 rounded-md">Thank you for your message! We'll get back to you soon.</p>
                )}
                {submitStatus === 'error' && (
                    <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">Something went wrong. Please try again later.</p>
                )}
            </div>
        </div>
      </section>
    </main>
  );
}

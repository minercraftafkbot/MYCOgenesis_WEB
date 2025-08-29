
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'About MYCOgenesis',
    description: 'Learn about our mission to harness the power of mycology for a sustainable future.',
};

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-slate-800 text-white">
                <div className="h-80 md:h-96 w-full relative">
                    <Image 
                        src="/images/about-hero.jpg" // Placeholder image
                        alt="Microscopic view of mycelium network"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold">About MYCOgenesis</h1>
                            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">Harnessing the power of mycology for a sustainable future.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Mission Section */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Our Mission</h2>
                    <p className="mt-4 text-xl text-gray-600">
                        To unlock the vast, untapped potential of fungi to solve some of the world’s most pressing challenges. From sustainable materials and alternative proteins to novel therapeutics and environmental remediation, we believe the fungal kingdom holds the key to a healthier planet and a more sustainable future.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                         <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Our Story</h2>
                    </div>
                    <div className="mt-12 text-lg text-gray-700 space-y-6">
                        <p>
                            Founded in 2021 by a team of passionate mycologists and engineers, MYCOgenesis began with a simple yet profound realization: the fungal kingdom is a vastly underexplored frontier of biological innovation. We saw a world of opportunity in the intricate networks of mycelium, the diverse metabolisms of yeasts, and the resilient structures of mushrooms.
                        </p>
                        <p>
                            Our journey started in a small lab, experimenting with local fungal strains and developing novel cultivation techniques. Today, we operate a state-of-the-art smart farm and research facility, where we are turning our vision into reality.
                        </p>
                    </div>
                </div>
            </section>

            {/* Call to Action to Team Page */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Meet the Visionaries</h2>
                 <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Our team is our greatest asset. Get to know the scientists, engineers, and creatives driving the mycology revolution.</p>
                 <div className="mt-8">
                     <a href="/team" className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg">Meet Our Team</a>
                 </div>
            </section>
        </div>
    );
}

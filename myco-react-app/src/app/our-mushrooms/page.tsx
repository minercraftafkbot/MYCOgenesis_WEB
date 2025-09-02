
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Mushrooms | MYCOgenesis',
    description: 'Explore the diverse range of gourmet and medicinal mushrooms cultivated at MYCOgenesis, from culinary favorites to unique varieties.',
};

export default function OurMushroomsPage() {
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800">
                        Explore Our Varieties
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
                        From versatile culinary staples to unique gourmet treasures, discover the exceptional quality and flavor of mushrooms grown in our smart farm.
                    </p>
                </div>

                <div className="space-y-20">
                    {/* Portobello Section */}
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-center">
                        <div className="relative w-full h-80 rounded-lg shadow-lg overflow-hidden">
                            <Image 
                                src="/images/home_page/portabelo_on_cuttingtale.png" 
                                alt="Portobello Mushrooms on a cutting board" 
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-800">Button, Cremini &amp; Portobello</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-4">
                                These are all the same mushroom (Agaricus bisporus) at different stages of maturity. From the mild, familiar white button to the slightly richer cremini and the large, meaty portobello, they are the versatile workhorses of the culinary world.
                            </p>
                        </div>
                    </div>

                    {/* Oyster Mushroom Section */}
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-center">
                        <div className="md:order-2 relative w-full h-80 rounded-lg shadow-lg overflow-hidden">
                            <Image 
                                src="/images/home_page/oyster_on_the table.png" 
                                alt="Oyster Mushrooms" 
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className="md:order-1">
                            <h2 className="text-3xl font-bold mb-3 text-slate-800">Oyster Mushrooms</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-4">
                                Named for their fan-like shape, Oyster mushrooms (Pleurotus ostreatus) come in a stunning array of colors like blue, gold, and pink. They are easy to cultivate and have a delicate, mild flavor perfect for a variety of dishes.
                            </p>
                        </div>
                    </div>
                    
                    {/* Lion's Mane Section */}
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-center">
                         <div className="relative w-full h-80 rounded-lg shadow-lg overflow-hidden">
                            <Image 
                                src="/images/Featured_varieties/lions_mane.png"
                                alt="Lion's Mane Mushroom"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-800">Lion&apos;s Mane</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-4">
                                With a unique, shaggy appearance resembling a lion&apos;s mane, this mushroom (Hericium erinaceus) is prized not only for its seafood-like flavor but also for its cognitive and neurological health benefits.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 p-8 bg-amber-100/50 border-l-4 border-amber-500 text-amber-800 rounded-md">
                    <p className="font-bold text-xl mb-2">Important Disclaimer:</p>
                    <p className="text-lg">
                        MYCOgenesis is dedicated to cultivating culinary and medicinal mushroom varieties. We do not cultivate, sell, or distribute psilocybin-containing mushrooms, which are classified as a Schedule 1 drug and are subject to legal restrictions.
                    </p>
                </div>
            </div>
        </div>
    );
}

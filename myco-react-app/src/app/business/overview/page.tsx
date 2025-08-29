
// myco-react-app/src/app/business/overview/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Overview | MYCOgenesis',
  description: 'An overview of MYCOgenesis, our mission, technology, and business model.',
};

export default function OverviewPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            Executive Overview
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Pioneering the Future of Mycology with Technology
          </p>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Our Mission</h2>
            <p className="mt-4 text-lg text-gray-700">
              MYCOgenesis is dedicated to advancing the field of mycology through cutting-edge technology and sustainable practices. We aim to unlock the vast potential of fungi to address global challenges in food security, material science, and environmental sustainability.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">The Opportunity</h2>
            <p className="mt-4 text-lg text-gray-700">
              The global mycology market is poised for exponential growth. Our proprietary IoT solutions and data-driven cultivation methods place us at the forefront of this revolution. We are creating a scalable, decentralized network of smart mushroom farms, creating new opportunities for food production and novel biomaterials.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Business Model</h2>
            <p className="mt-4 text-lg text-gray-700">
              Our business model is centered around a Platform-as-a-Service (PaaS) offering for our smart mycology technology, supplemented by the direct sale of gourmet and medicinal mushrooms. We are seeking strategic partners and investors to help us scale our operations and expand our reach.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

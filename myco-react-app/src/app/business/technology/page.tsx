
// myco-react-app/src/app/business/technology/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Technology | MYCOgenesis',
  description: 'Explore the innovative IoT and data-driven technology powering MYCOgenesis.',
};

export default function TechnologyPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            Our Technology
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Data-driven cultivation for unparalleled efficiency and yield.
          </p>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Proprietary IoT Sensors</h2>
            <p className="mt-4 text-lg text-gray-700">
              Our custom-built sensors monitor critical environmental parameters in real-time, including CO2 levels, temperature, humidity, and substrate moisture. This constant stream of data allows for precise control over the growing environment, optimizing for yield and quality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Centralized Analytics Platform</h2>
            <p className="mt-4 text-lg text-gray-700">
              All data from our IoT network is fed into a centralized analytics platform. Using machine learning models, we analyze this data to identify optimal growing conditions, predict yields, and even detect potential issues before they arise. This predictive capability is a game-changer for large-scale mushroom cultivation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Automated Environmental Controls</h2>
            <p className="mt-4 text-lg text-gray-700">
              Our platform doesn&apos;t just monitor; it acts. Based on the insights from our analytics, the system automatically adjusts lighting, ventilation, and irrigation to maintain the perfect conditions for each specific mushroom strain. This level of automation reduces labor costs and minimizes the risk of human error.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

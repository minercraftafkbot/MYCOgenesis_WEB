
// myco-react-app/src/app/business/financials/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financials | MYCOgenesis',
  description: 'An overview of the MYCOgenesis business model and financial projections.',
};

export default function FinancialsPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            Business Model & Financials
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            A scalable model for a high-growth market.
          </p>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Revenue Streams</h2>
            <p className="mt-4 text-lg text-gray-700">
              Our primary revenue will be generated through a tiered subscription model for our Platform-as-a-Service (PaaS). This will be supplemented by direct-to-consumer sales of our own cultivated gourmet mushrooms. Future revenue streams will include licensing of our technology and data analytics services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Financial Projections</h2>
            <p className="mt-4 text-lg text-gray-700">
              Detailed financial projections are available to qualified investors upon request. Our model shows a clear path to profitability within three years, driven by the scalability of our PaaS solution and the high demand for specialty mushrooms.
            </p>
            <p className="mt-4 text-lg text-gray-700">
              For access to our detailed financial model and investment memorandum, please get in touch via our partnerships page.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

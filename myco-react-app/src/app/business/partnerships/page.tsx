
// myco-react-app/src/app/business/partnerships/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partnerships | MYCOgenesis',
  description: 'Explore investment and supplier opportunities with MYCOgenesis.',
};

export default function PartnershipsPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            Partnership Opportunities
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Join us in building the future of mycology.
          </p>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">For Investors</h2>
            <p className="mt-4 text-lg text-gray-700">
              MYCOgenesis is currently seeking seed funding to scale our manufacturing capabilities and expand our market reach. We offer a unique opportunity to invest in a rapidly growing market with a company that has a clear technological advantage. For a copy of our investment memorandum, please contact us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">For Suppliers</h2>
            <p className="mt-4 text-lg text-gray-700">
              We are looking for reliable suppliers of high-quality, sustainable substrate materials and other cultivation supplies. If you share our commitment to quality and sustainability, we would love to hear from you.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Strategic Alliances</h2>
            <p className="mt-4 text-lg text-gray-700">
              We are open to forming strategic alliances with research institutions, food distributors, and companies in the biomaterials space. Together, we can accelerate innovation and create new markets for mushroom-based products.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

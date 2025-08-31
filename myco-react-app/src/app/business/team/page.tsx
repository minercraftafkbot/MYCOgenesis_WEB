
// myco-react-app/src/app/business/team/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team | MYCOgenesis',
  description: 'Meet the experienced team behind MYCOgenesis, driving innovation in mycology.',
};

export default function TeamPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            Meet the Team
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            A blend of expertise in technology, mycology, and business.
          </p>
        </div>

        {/* Placeholder for team members. In a real application, you would map over an array of team data. */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/4 text-center">
              <div className="w-32 h-32 rounded-full bg-slate-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-slate-800">Alex Chen</h3>
              <p className="text-md text-gray-600">CEO & Co-Founder</p>
            </div>
            <div className="md:w-3/4">
              <p className="text-lg text-gray-700">
                With a background in IoT engineering and a passion for sustainable agriculture, Alex leads the charge in developing our smart mycology solutions. His vision is to create a global network of connected farms.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/4 text-center">
              <div className="w-32 h-32 rounded-full bg-slate-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-slate-800">Dr. Elena Petrov</h3>
              <p className="text-md text-gray-600">Head of Mycology</p>
            </div>
            <div className="md:w-3/4">
              <p className="text-lg text-gray-700">
                Elena brings over 15 years of research experience in fungal genetics and cultivation. She oversees all aspects of our mycological research and development, ensuring the quality and efficacy of our strains.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

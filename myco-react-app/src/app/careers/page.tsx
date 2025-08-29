
// myco-react-app/src/app/careers/page.tsx
import { sanityClient } from '../../lib/sanity';
import { Career } from '../../types/sanity';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers | MYCOgenesis',
    description: 'Join our team and help us revolutionize the world of mycology.',
};

async function getCareers(): Promise<Career[]> {
    const careers = await sanityClient.fetch(`*[_type == "career"]|order(title asc)`);
    return careers;
}

export default async function CareersPage() {
    const careers = await getCareers();

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
                        Join Our Team
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        We're looking for passionate individuals to join us on our mission.
                    </p>
                </div>

                <div className="mt-20 space-y-8">
                    {careers.map((career) => (
                        <div key={career._id} className="border p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold text-slate-800">{career.title}</h2>
                            <p className="mt-2 text-md text-teal-600 font-medium">{career.location}</p>
                            <p className="mt-4 text-slate-600">{career.description}</p>
                            <div className="mt-6">
                                <a href={`mailto:careers@mycogenesis.com?subject=Application for ${career.title}`}
                                   className="text-teal-600 hover:text-teal-700 font-semibold">
                                    Apply Now &rarr;
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

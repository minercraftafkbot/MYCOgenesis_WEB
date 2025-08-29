
// myco-react-app/src/app/team/page.tsx
import { sanityClient } from '../../lib/sanity';
import { TeamMember } from '../../types/sanity';
import TeamMemberCard from '../../components/TeamMemberCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Team | MYCOgenesis',
    description: 'Meet the team of scientists, engineers, and visionaries driving the future of mycology.',
};

async function getTeamMembers(): Promise<TeamMember[]> {
    const members = await sanityClient.fetch(`*[_type == "teamMember"]|order(order asc)`);
    return members;
}

export default async function TeamPage() {
    const members = await getTeamMembers();

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
                        Meet Our Team
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        A dedicated group of professionals committed to innovation in mycology.
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {members.map((member) => (
                        <TeamMemberCard key={member._id} member={member} />
                    ))}
                </div>
            </div>
        </div>
    );
}

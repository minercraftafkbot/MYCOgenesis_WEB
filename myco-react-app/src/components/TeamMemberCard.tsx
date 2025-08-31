
// myco-react-app/src/components/TeamMemberCard.tsx
import { TeamMember } from '../types/sanity';
import { urlFor } from '../lib/sanity';
import Image from 'next/image';

interface TeamMemberCardProps {
    member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
    return (
        <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
                {member.image && (
                    <Image
                        src={urlFor(member.image).width(200).height(200).url()}
                        alt={member.name || 'Team member'}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                    />
                )}
            </div>
            <h3 className="text-xl font-semibold text-slate-800">{member.name}</h3>
            <p className="text-md text-teal-600 font-medium">{member.role}</p>
            <p className="mt-2 text-slate-600">{member.bio}</p>
        </div>
    );
}

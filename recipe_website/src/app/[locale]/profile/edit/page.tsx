import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileEditForm from '@/components/ProfileEditForm';

export default async function EditProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/profile/edit');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            location: true,
            website: true,
        },
    });

    if (!user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto container-padding">
                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
                    Edit Profile
                </h1>
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <ProfileEditForm user={user} />
                </div>
            </div>
        </div>
    );
}

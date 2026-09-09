import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CollectionForm from "@/components/CollectionForm";

export default async function NewFavListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/favLists/new");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto container-padding">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
          Create Fav List
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <CollectionForm />
        </div>
      </div>
    </div>
  );
}

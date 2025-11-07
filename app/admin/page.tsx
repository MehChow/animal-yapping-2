import { requireRole } from "@/lib/auth-utils";
import { PrismaClient } from "@/app/generated/prisma/client";
import { AddVideoDialog } from "@/components/admin/AddVideoDialog";

const prisma = new PrismaClient();

const AdminPage = async () => {
  // Protect this page - only Admin can access
  const user = await requireRole(["Admin"]);

  // Fetch some basic statistics
  const [totalUsers, totalVideos, totalComments] = await Promise.all([
    prisma.user.count(),
    prisma.video.count(),
    prisma.comment.count(),
  ]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/70">
              Welcome back, {user.name || user.email}!
            </p>
          </div>
          <AddVideoDialog />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg border border-white/10 p-6 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <h3 className="text-sm font-medium text-white/60 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-6 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <h3 className="text-sm font-medium text-white/60 mb-2">
              Total Videos
            </h3>
            <p className="text-3xl font-bold text-white">{totalVideos}</p>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-6 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <h3 className="text-sm font-medium text-white/60 mb-2">
              Total Comments
            </h3>
            <p className="text-3xl font-bold text-white">{totalComments}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20">
              Manage Videos
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20">
              View All Users
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20">
              Moderate Comments
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

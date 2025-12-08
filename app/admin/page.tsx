import { requireRole } from "@/lib/auth-utils";
import { PrismaClient } from "@/app/generated/prisma/client";
import { AddVideoDialog } from "@/components/admin/AddVideoDialog";
import { AddPostDialog } from "@/components/admin/AddPostDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const prisma = new PrismaClient();

const AdminPage = async () => {
  // Protect this page - only Admin can access
  const user = await requireRole(["Admin"]);

  // Fetch some basic statistics
  const [
    totalUsers,
    totalNormalVideos,
    totalShortsVideos,
    totalVideoLikes,
    totalComments,
    totalPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.video.count({
      where: {
        videoType: "Normal",
      },
    }),
    prisma.video.count({
      where: {
        videoType: "Shorts",
      },
    }),
    prisma.like.count(),
    prisma.comment.count(),
    prisma.post.count(),
  ]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex-col md:flex-row flex items-center justify-between gap-4">
          <div>
            {/* Title and welcome message */}
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/70 text-center md:text-left">
              Welcome back, {user.name || user.email}!
            </p>
          </div>
          {/* Add Post and Add Video buttons */}
          <div className="flex gap-3">
            <AddPostDialog />
            <AddVideoDialog />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white/60">
                Total Videos
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-3xl font-bold text-white">
                  {totalNormalVideos}
                </p>
              </CardContent>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white/60">
                Total Shorts
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-3xl font-bold text-white">
                  {totalShortsVideos}
                </p>
              </CardContent>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white/60">
                Total Video Likes
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-3xl font-bold text-white">
                  {totalVideoLikes}
                </p>
              </CardContent>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white/60">
                Total Users
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
              </CardContent>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white/60">
                Total Comments
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-3xl font-bold text-white">{totalComments}</p>
              </CardContent>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white/60">
                Total Posts
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-3xl font-bold text-white">{totalPosts}</p>
              </CardContent>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/manage-video"
              className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20"
            >
              Manage Videos
            </Link>
            <Link
              href="/admin/manage-user"
              className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20"
            >
              View All Users
            </Link>
            <Link
              href="/admin/manage-comment"
              className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20"
            >
              Moderate Comments
            </Link>
            <Link
              href="/admin/analytics"
              className="bg-white/10 text-white hover:bg-white/20 rounded-md px-4 py-3 text-left font-medium transition-colors cursor-pointer border border-white/20"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

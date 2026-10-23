import CourseSidebar from "@/components/CourseSidebar";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <CourseSidebar />
      <div className="min-w-0 flex-1 lg:ml-0">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-16 lg:pt-10">{children}</div>
      </div>
    </div>
  );
}

import { getRelayProjectForOverview } from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { ProjectBreadcrumbActions } from "./_components/project-breadcrumb-actions";
import { ProjectSubNav } from "./_components/project-sub-nav";

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const project = await getRelayProjectForOverview(id);
    if (!project) notFound();

    return (
        <div className="w-full space-y-6">
            <div className="mt-16"><div className="h-1 w-full bg-border rounded-full"></div></div>
            <ProjectBreadcrumbActions
                projectId={id}
                projectName={project.name}
            />
            <ProjectSubNav projectId={id} />
            {children}
        </div>
    );
}

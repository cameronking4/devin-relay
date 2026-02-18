import { getRelayProjectForOverview } from "@/server/actions/relay/queries";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { notFound } from "next/navigation";
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
            <p className="text-muted-foreground text-md font-medium mt-6">
                <Link
                    href={siteUrls.relay.projects}
                    className="hover:text-foreground underline"
                >
                    Projects
                </Link>
                {" / "}
                <span className="text-foreground">{project.name}</span>
            </p>
            <ProjectSubNav projectId={id} />
            {children}
        </div>
    );
}

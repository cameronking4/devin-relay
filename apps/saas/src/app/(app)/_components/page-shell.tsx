import { type ElementType } from "react";

type AppPageShellProps = {
    children: React.ReactNode;
    as?: ElementType;
    title: string;
    description: string;
    /** Optional slot for header actions (e.g. "New project" button) */
    actions?: React.ReactNode;
};

export function AppPageShell({
    children,
    as,
    title,
    description,
    actions,
}: AppPageShellProps) {
    const Container = as ?? "main";

    return (
        <div className="w-full space-y-8">
            <div className="mt-12">
                <PageHeader
                    title={title}
                    description={description}
                    actions={actions}
                />
            </div>
            <Container className="space-y-8 pb-8">{children}</Container>
        </div>
    );
}

type PageHeaderProps = {
    title: string;
    description: string;
    actions?: React.ReactNode;
};

function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <header className="flex w-full flex-col gap-1 border-b border-border py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
                <h1 className="font-heading text-2xl font-bold">{title}</h1>
                <p className="mt-0.5 max-w-xl text-muted-foreground">
                    {description}
                </p>
            </div>
            {actions ? (
                <div className="mt-4 shrink-0 sm:mt-0">{actions}</div>
            ) : null}
        </header>
    );
}

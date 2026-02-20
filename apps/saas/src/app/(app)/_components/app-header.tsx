import { SidebarTrigger } from "@/components/ui/sidebar";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";

type AppHeaderProps = {
    showOrgSwitcher?: boolean;
};

export function AppHeader(_props: AppHeaderProps) {
    return (
        <header className="flex h-14 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
                orientation="vertical"
                className="mr-2 h-4 data-[orientation=vertical]:h-4"
            />
            <Icons.logo hideTextOnMobile={false} />
        </header>
    );
}

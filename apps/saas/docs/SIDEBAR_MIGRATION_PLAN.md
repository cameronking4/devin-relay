# SaaS Sidebar Migration Plan: Custom → shadcn Sidebar

This plan describes how to replace the current custom sidebar with the [shadcn Sidebar](https://ui.shadcn.com/docs/components/sidebar) component and follow its best practices (collapse-to-icons, `SidebarProvider`/`SidebarInset`, mobile sheet, etc.).

---

## 1. Current State Summary

### 1.1 Files involved

| File | Role |
|------|------|
| `src/app/(app)/_components/sidebar.tsx` | Main sidebar: logo, user dropdown, org switcher, scroll area, `SidebarNav` |
| `src/app/(app)/_components/sidebar-nav.tsx` | Nav tree from `sidebarConfig`: groups, accordions for submenus, `NavLink` |
| `src/app/(app)/_components/layout-shell.tsx` | App shell: sticky sidebar (desktop) + `AppHeader` (mobile) + main content |
| `src/app/(app)/_components/mobile-sidenav.tsx` | Mobile: `Sheet` + current `Sidebar` inside |
| `src/app/(app)/_components/app-header.tsx` | Header: `MobileSidenav` trigger + logo |
| `src/config/sidebar.ts` | Nav config: `navIds`, `navigation` (Admin, Dashboard, Organization, Resources), `filteredNavItems()` |

### 1.2 Current behavior

- **Desktop**: Sticky left column (`w-52` / `xl:w-60`), no collapse; scroll area for nav.
- **Mobile**: Hamburger opens a `Sheet` that renders the same `Sidebar` (no logo in sheet).
- **Filtering**: User layout removes `admin`; admin layout includes only `admin` via `sideNavRemoveIds` / `sideNavIncludedIds`.
- **Nav structure**: Sections (Dashboard, Organization, Resources) with optional submenus (e.g. Members → Org Members, Invite Members) via Accordion.
- **Data**: Sidebar is async (getUser, getOrganizations) for UserDropdown and OrgSelectDropdown.

### 1.3 What’s not there yet

- No `components/ui/sidebar.tsx` (shadcn Sidebar).
- No `SidebarProvider` / `SidebarInset` layout.
- No collapse-to-icons or `SidebarTrigger` in header.
- No breadcrumbs in header (optional; can add later with shadcn breadcrumb).

---

## 2. Target Architecture (shadcn Best Practices)

### 2.1 Layout hierarchy

- **Root (app shell)**: `SidebarProvider` wraps everything.
- **Sidebar**: shadcn `Sidebar` with `collapsible="icon"` (collapse to icons on desktop).
- **Main content**: Wrapped in `SidebarInset` so it resizes when sidebar expands/collapses.
- **Header (inside SidebarInset)**: `SidebarTrigger` + optional breadcrumb + existing logo (and any future actions).
- **Mobile**: shadcn Sidebar’s built-in mobile behavior (Sheet/offcanvas) so one component handles both.

### 2.2 Component mapping

| Current | Target (shadcn) |
|--------|------------------|
| Custom `<aside>` + scroll | `Sidebar` + `SidebarContent` (scrollable) |
| Logo + UserDropdown + OrgSelect | `SidebarHeader` (logo + org) and `SidebarFooter` (user) or keep both in header |
| Section labels + nav list | `SidebarGroup` + `SidebarGroupLabel` + `SidebarGroupContent` |
| Nav links / accordion items | `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton` (with `asChild` + `Link`, `isActive`) |
| Submenus (e.g. Members) | `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` or `Collapsible` + `SidebarGroup` |
| Mobile sheet with sidebar | Rely on shadcn Sidebar’s built-in mobile (no separate `MobileSidenav` wrapping current Sidebar) |
| “Main content” column | `SidebarInset` |
| Hamburger / open sidebar | `SidebarTrigger` in header |

### 2.3 Data flow

- **Server vs client**: shadcn Sidebar primitives are client components. Keep data loading in server components and pass props into a client `AppSidebar` (e.g. `user`, `currentOrg`, `userOrgs`, `navItems`).
- **Nav config**: Keep `src/config/sidebar.ts` and `filteredNavItems()`. Build `SidebarMenu` / `SidebarGroup` from the filtered array so admin vs user layouts stay the same.

---

## 3. Implementation Steps

### Step 1: Install shadcn Sidebar

From `apps/saas`:

```bash
npx shadcn@latest add sidebar
```

This adds `src/components/ui/sidebar.tsx` and any dependencies (e.g. Sheet if not already present). If the CLI asks about overwriting or dependencies, accept as needed.

**Check**: Sidebar renders in isolation (e.g. minimal layout with `SidebarProvider` + `Sidebar` + `SidebarInset`).

---

### Step 2: Add sidebar CSS variables (optional)

If you use a custom theme, add or align sidebar tokens in your global CSS (see [Sidebar theming](https://ui.shadcn.com/docs/components/sidebar#theming)):

- `--sidebar-background`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

Default shadcn values work without this step.

---

### Step 3: Create `AppSidebar` (new client component)

- **Path**: `src/app/(app)/_components/app-sidebar.tsx` (or keep the name `sidebar.tsx` and refactor in place; plan assumes a dedicated `AppSidebar` that uses shadcn primitives).

**Structure**:

1. **Sidebar** (root)
   - `collapsible="icon"` so desktop can collapse to icons.
   - Optional: `variant="inset"` only if you want inset styling; then main content must be in `SidebarInset`.

2. **SidebarHeader**
   - Logo (Link to dashboard).
   - Org switcher (existing `OrgSelectDropdown`); consider `SidebarMenu` + `SidebarMenuButton` + dropdown trigger for consistency with [sidebar-07](https://ui.shadcn.com/blocks/sidebar) (team/workspace switcher in header).

3. **SidebarContent**
   - For each section in `navItems` (from config):
     - **SidebarGroup**
       - **SidebarGroupLabel**: section title (e.g. “Dashboard”, “Organization”).
       - **SidebarGroupContent**
         - **SidebarMenu**: map over `section.items`.
           - Items with **subMenu**: use **SidebarMenuSub** (or a `Collapsible` + `SidebarGroup` if you prefer accordion UX).
           - Items without subMenu: **SidebarMenuItem** → **SidebarMenuButton** `asChild` with **Link**, `isActive={isLinkActive(pathname, item.href)}`.

4. **SidebarFooter**
   - User dropdown (existing `UserDropdown`), e.g. wrapped in `SidebarMenu` + `SidebarMenuButton` for styling.

**Props**: Accept `user`, `orgData` (currentOrg + userOrgs), and `navItems` (filtered array from `sidebarConfig.filteredNavItems(...)`). This keeps the component client and data passed from a server parent.

**Icons**: Use existing icons from `sidebar.ts` (e.g. `item.icon`). In collapsed (icon) state, shadcn Sidebar + `SidebarMenuButton` handle tooltips; you can rely on that or keep a thin `TooltipProvider` if needed.

---

### Step 4: Refactor layout shell to SidebarProvider + SidebarInset

**File**: `src/app/(app)/_components/layout-shell.tsx`.

- Wrap the whole shell in **SidebarProvider** (no need for `defaultOpen` unless you want a default collapsed state).
- Replace the current sticky `<div>` sidebar column with **AppSidebar** (no wrapper div for width; shadcn Sidebar handles width via CSS variables).
- Wrap the main content (header + section) in **SidebarInset**.
- Inside **SidebarInset**:
  - **Header**: Same as current app header but add **SidebarTrigger** (e.g. left of logo or replacing the current hamburger). Use `SidebarTrigger` from `@/components/ui/sidebar` so it toggles the same sidebar (desktop collapse + mobile open).
- Remove the separate “mobile header” that only shows on small screens if it’s redundant: one header inside `SidebarInset` with `SidebarTrigger` works for both (trigger opens sheet on mobile, toggles icon state on desktop).

**Data loading**: Layout shell (or a parent server layout) should still fetch user and orgs, then pass them into a server-rendered wrapper that renders `SidebarProvider` and `AppSidebar` (with `navItems` and org/user props). Keep using `Suspense` with a sidebar skeleton (see Step 6) while data loads.

---

### Step 5: Remove or simplify MobileSidenav

- shadcn Sidebar’s default behavior uses a Sheet on mobile. So **AppSidebar** is the single sidebar for both desktop and mobile.
- **Option A**: Delete `mobile-sidenav.tsx` and stop importing it. **AppHeader** only renders logo + **SidebarTrigger** (and any other header actions). The trigger opens the sidebar sheet on mobile.
- **Option B**: Keep a thin **MobileSidenav** that only renders **SidebarTrigger** for the “hamburger” button and ensure it doesn’t render its own Sheet/sidebar (so one source of truth).

Recommendation: **Option A** — use **SidebarTrigger** in the header and remove **MobileSidenav**.

---

### Step 6: Sidebar loading state

- **SidebarLoading**: Replace current custom skeleton with a skeleton that matches shadcn structure: e.g. **Sidebar** with **SidebarHeader** / **SidebarContent** / **SidebarFooter** placeholders using **SidebarMenuSkeleton** (or plain `Skeleton` components) so layout doesn’t shift.
- Keep this inside `Suspense` in the layout shell while `AppSidebar`’s data (user, orgs) is loading.

---

### Step 7: Preserve layout-specific nav filtering

- **User layout** (`(user)/layout.tsx`): Still passes `sideNavRemoveIds={[sidebarConfig.navIds.admin]}` (or equivalent) into the shell.
- **Admin layout** (`admin/layout.tsx`): Still passes `sideNavIncludedIds={[sidebarConfig.navIds.admin]}`, `showOrgSwitcher={false}`.
- **Layout shell** should pass these into the place that computes `navItems` (e.g. server layout or a small helper) and then pass `navItems` + `showOrgSwitcher` into **AppSidebar**. No change to `sidebarConfig` or `filteredNavItems` logic.

---

### Step 8: Project sub-nav (unchanged)

- **ProjectSubNav** (Overview / Triggers / Executions) stays as-is: it’s page-level tabs inside `SidebarInset`, not part of the app sidebar. Optionally you could later move it into the header as a breadcrumb + tabs, but that’s out of scope for this migration.

---

### Step 9: Keyboard shortcut

- shadcn Sidebar’s `SidebarProvider` typically wires `cmd+b` / `ctrl+b` to toggle. If your `sidebar.tsx` exposes `SIDEBAR_KEYBOARD_SHORTCUT`, ensure it’s set (e.g. `"b"`). No extra work if the default is already there.

---

### Step 10: Theming and RTL (optional)

- **Theming**: If you need to match your app theme, set the sidebar CSS variables in your global styles.
- **RTL**: If you support RTL, add the `dir` prop to **Sidebar** and use the RTL-friendly classes as in [shadcn Sidebar RTL](https://ui.shadcn.com/docs/components/sidebar#rtl). Not required for initial migration.

---

## 4. File Change Checklist

| Action | File / area |
|--------|-------------|
| Add | `src/components/ui/sidebar.tsx` (via CLI) |
| Add | `src/app/(app)/_components/app-sidebar.tsx` (new client sidebar using shadcn primitives + existing config) |
| Refactor | `src/app/(app)/_components/layout-shell.tsx` → SidebarProvider, AppSidebar, SidebarInset, header with SidebarTrigger |
| Refactor | `src/app/(app)/_components/app-header.tsx` → SidebarTrigger + logo only (remove MobileSidenav or make it a thin trigger) |
| Remove or simplify | `src/app/(app)/_components/mobile-sidenav.tsx` |
| Deprecate / remove | Current `src/app/(app)/_components/sidebar.tsx` (logic moved to AppSidebar + layout) |
| Refactor | `src/app/(app)/_components/sidebar-nav.tsx` → logic merged into AppSidebar (SidebarGroup + SidebarMenu from config); file can be removed or kept as a pure “nav tree” renderer used by AppSidebar |
| Keep | `src/config/sidebar.ts` (same config and filtering) |
| Update | Sidebar loading skeleton to match shadcn structure (in layout or in a dedicated `sidebar-loading.tsx`) |

---

## 5. Testing and QA

- **Desktop**: Sidebar expands/collapses with trigger (and `cmd+b` / `ctrl+b`). Main content (`SidebarInset`) resizes. Active nav item highlighted.
- **Mobile**: Trigger opens sidebar in a sheet; closing sheet or navigating doesn’t leave UI broken.
- **User layout**: No admin section; org switcher and user dropdown work; Members submenu works.
- **Admin layout**: Only admin section; no org switcher.
- **Accessibility**: Focus order, keyboard nav, and screen reader labels (e.g. “Toggle Sidebar”) are correct.

---

## 6. Order of Work (Suggested)

1. Install sidebar UI (`npx shadcn@latest add sidebar`).
2. Implement **AppSidebar** (client) with static or mock nav + org + user to validate structure and collapse behavior.
3. Refactor **layout-shell** to **SidebarProvider** + **AppSidebar** + **SidebarInset** and header with **SidebarTrigger**; keep passing existing props (nav filter, showOrgSwitcher) and real data (user, orgs, navItems).
4. Replace custom sidebar and sidebar-nav with AppSidebar and remove or simplify mobile-sidenav and old sidebar loading.
5. Align loading skeleton and run full QA (desktop, mobile, user vs admin layouts).

This plan gets you to a single, shadcn-based sidebar that collapses to icons on desktop, uses SidebarInset for main content, and keeps your current nav config and layout-specific filtering intact.

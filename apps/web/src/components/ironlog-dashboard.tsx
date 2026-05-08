import { Button } from "@project-construction/ui/components/button";

const navItems = [
    { id: "equipment", label: "Equipment" },
    { id: "audit", label: "Audit Log" },
    { id: "map", label: "Map" },
] as const;

type EquipmentStatus = "active" | "available" | "maintenance" | "offline";

const statusConfig: Record<
    EquipmentStatus,
    { label: string; badgeClass: string; dotClass: string }
> = {
    active: {
        label: "Active",
        badgeClass: "il-badge-active",
        dotClass: "il-status-dot-active",
    },
    available: {
        label: "Available",
        badgeClass: "il-badge-available",
        dotClass: "il-status-dot-available",
    },
    maintenance: {
        label: "Maintenance",
        badgeClass: "il-badge-maintenance",
        dotClass: "il-status-dot-maintenance",
    },
    offline: {
        label: "Offline",
        badgeClass: "il-badge-offline",
        dotClass: "il-status-dot-offline",
    },
};

const equipmentList = [
    {
        id: "EX-204",
        name: "CAT 336 Excavator",
        status: "active",
        site: "Mactan Reclaim 3",
        operator: "Rogelio dela Cruz",
        checkout: "07:42 PHT",
    },
    {
        id: "DZ-118",
        name: "Komatsu D65 Dozer",
        status: "available",
        site: "San Jose Cut 2",
        operator: "Unassigned",
        checkout: "06:10 PHT",
    },
    {
        id: "WL-092",
        name: "Volvo L120H Loader",
        status: "active",
        site: "Laguna Yard 5",
        operator: "Marites Villalobos",
        checkout: "07:18 PHT",
    },
    {
        id: "GR-310",
        name: "CAT 140M Grader",
        status: "maintenance",
        site: "North Harbor 1",
        operator: "Shop Team",
        checkout: "05:55 PHT",
    },
    {
        id: "TK-077",
        name: "Hitachi ZX200 Trackhoe",
        status: "offline",
        site: "Batangas Quarry South",
        operator: "Unassigned",
        checkout: "04:22 PHT",
    },
    {
        id: "CR-401",
        name: "Grove RT760E Crane",
        status: "active",
        site: "Iloilo Bridge 2",
        operator: "Kenjie Bautista",
        checkout: "07:05 PHT",
    },
] as const;

const auditLog = [
    {
        id: 1,
        initials: "RD",
        name: "Rogelio dela Cruz",
        action: "checked out",
        equipmentId: "EX-204",
        detail: "for Mactan Reclaim 3.",
        time: "08:05 PHT",
    },
    {
        id: 2,
        initials: "MV",
        name: "Marites Villalobos",
        action: "transferred",
        equipmentId: "WL-092",
        detail: "to Laguna Yard 5.",
        time: "07:52 PHT",
    },
    {
        id: 3,
        initials: "KB",
        name: "Kenjie Bautista",
        action: "assigned",
        equipmentId: "CR-401",
        detail: "to Iloilo Bridge 2.",
        time: "07:30 PHT",
    },
    {
        id: 4,
        initials: "JR",
        name: "Jayson Ramos",
        action: "flagged",
        equipmentId: "GR-310",
        detail: "for maintenance at North Harbor 1.",
        time: "07:05 PHT",
    },
    {
        id: 5,
        initials: "LM",
        name: "Liza Malabanan",
        action: "returned",
        equipmentId: "DZ-118",
        detail: "to San Jose Cut 2.",
        time: "06:40 PHT",
    },
    {
        id: 6,
        initials: "NS",
        name: "Noel Sapida",
        action: "reported",
        equipmentId: "TK-077",
        detail: "offline at Batangas Quarry South.",
        time: "06:22 PHT",
    },
    {
        id: 7,
        initials: "AR",
        name: "Aira Reyes",
        action: "handed off",
        equipmentId: "EX-204",
        detail: "to the day crew.",
        time: "05:58 PHT",
    },
    {
        id: 8,
        initials: "RD",
        name: "Ramil Dizon",
        action: "checked out",
        equipmentId: "WL-092",
        detail: "for morning yard work.",
        time: "05:40 PHT",
    },
] as const;

const mapPins = [
    { id: "EX-204", position: "left-[18%] top-[22%]" },
    { id: "WL-092", position: "left-[58%] top-[28%]" },
    { id: "CR-401", position: "left-[34%] top-[62%]" },
    { id: "GR-310", position: "left-[72%] top-[58%]" },
] as const;

const statusFilters = [
    "All status",
    "Active",
    "Available",
    "Maintenance",
    "Offline",
];
const siteFilters = [
    "All sites",
    "Mactan Reclaim 3",
    "San Jose Cut 2",
    "Laguna Yard 5",
    "North Harbor 1",
];

export default function IronLogDashboard() {
    return (
        <div className="grid min-h-full grid-cols-1 lg:grid-cols-[240px_1fr]">
            <aside className="hidden flex-col border-r border-border bg-card lg:flex">
                <div className="px-4 py-4">
                    <div className="il-section-label">Navigation</div>
                </div>
                <nav className="flex flex-col gap-2 px-2 pb-4">
                    {navItems.map((item, index) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            aria-current={index === 0 ? "page" : undefined}
                            className={`il-touch flex items-center justify-between gap-3 border border-transparent px-3 py-2 text-sm font-medium uppercase tracking-wide text-foreground ${
                                index === 0
                                    ? "bg-secondary"
                                    : "hover:bg-secondary"
                            }`}
                        >
                            <span>{item.label}</span>
                            <span className="text-muted-foreground">
                                {index + 1}
                            </span>
                        </a>
                    ))}
                </nav>
                <div className="mt-auto border-t border-border px-4 py-4 text-sm text-muted-foreground">
                    Shift: Day Crew
                </div>
            </aside>

            <main className="flex flex-col gap-6 px-4 py-6 pb-24 lg:px-8">
                <section className="flex flex-col gap-2">
                    <span className="il-section-label">
                        Field Ops Dashboard
                    </span>
                    <h1 className="il-display text-2xl text-foreground">
                        IronLog Equipment Tracking
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Live status and accountability for field equipment,
                        keys, and operator handoffs.
                    </p>
                </section>

                <section
                    id="equipment"
                    className="flex flex-col gap-4 scroll-mt-24"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="il-display text-xl">
                                Equipment List
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Monitor active units, operators, and key
                                checkout times.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border border-border bg-card px-4 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="il-section-label">Status</span>
                            <div className="flex flex-wrap gap-2">
                                {statusFilters.map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={
                                            filter === "All status"
                                                ? "secondary"
                                                : "outline"
                                        }
                                        className="il-touch h-12 px-4 text-sm"
                                        aria-pressed={filter === "All status"}
                                    >
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="il-section-label">Site</span>
                            <div className="flex flex-wrap gap-2">
                                {siteFilters.map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={
                                            filter === "All sites"
                                                ? "secondary"
                                                : "outline"
                                        }
                                        className="il-touch h-12 px-4 text-sm"
                                        aria-pressed={filter === "All sites"}
                                    >
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="grid gap-4 lg:grid-cols-2">
                            {equipmentList.map((equipment) => {
                                const status = statusConfig[equipment.status];

                                return (
                                    <article
                                        key={equipment.id}
                                        className="flex flex-col gap-4 border border-border bg-card px-4 py-4 text-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="il-eq-id">
                                                    {equipment.id}
                                                </span>
                                                <h3 className="il-display text-lg text-foreground">
                                                    {equipment.name}
                                                </h3>
                                            </div>
                                            <span
                                                className={`flex items-center gap-2 border px-2 py-1 text-sm font-semibold uppercase tracking-wide ${status.badgeClass}`}
                                            >
                                                <span
                                                    className={`il-status-dot ${status.dotClass}`}
                                                />
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-muted-foreground">
                                                    Assigned site
                                                </span>
                                                <span className="text-foreground">
                                                    {equipment.site}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-muted-foreground">
                                                    Current operator
                                                </span>
                                                <span className="text-foreground">
                                                    {equipment.operator}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border pt-3">
                                            <span className="text-muted-foreground">
                                                Key checkout
                                            </span>
                                            <span className="il-timestamp">
                                                {equipment.checkout}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div
                            id="map"
                            className="flex flex-col gap-3 scroll-mt-24"
                        >
                            <div>
                                <h3 className="il-display text-lg">Site Map</h3>
                                <p className="text-sm text-muted-foreground">
                                    Static position view with tagged equipment
                                    IDs.
                                </p>
                            </div>
                            <div className="relative h-72 w-full overflow-hidden border border-border bg-[#1a2020]">
                                <div className="absolute left-3 top-3 text-sm uppercase tracking-widest text-muted-foreground">
                                    Map Placeholder
                                </div>
                                {mapPins.map((pin) => (
                                    <div
                                        key={pin.id}
                                        className={`absolute ${pin.position} flex items-center gap-2`}
                                    >
                                        <span className="il-map-pin flex items-center justify-center border border-border px-2 py-1 text-sm font-semibold">
                                            {pin.id}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="audit"
                    className="flex flex-col gap-4 scroll-mt-24"
                >
                    <div>
                        <h2 className="il-display text-xl">Audit Log</h2>
                        <p className="text-sm text-muted-foreground">
                            Chronological equipment events across sites and
                            shifts.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {auditLog.map((entry) => (
                            <article
                                key={entry.id}
                                className="flex flex-col gap-3 border border-border bg-card px-4 py-4 text-sm sm:flex-row sm:items-center"
                            >
                                <div className="il-avatar">
                                    {entry.initials}
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <p className="text-foreground">
                                        <span className="font-semibold">
                                            {entry.name}
                                        </span>{" "}
                                        {entry.action}
                                        <span className="il-eq-chip">
                                            {entry.equipmentId}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {" "}
                                            {entry.detail}
                                        </span>
                                    </p>
                                </div>
                                <div className="il-timestamp sm:text-right">
                                    {entry.time}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-card px-2 py-2 lg:hidden">
                {navItems.map((item, index) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`il-touch flex flex-1 items-center justify-center text-sm font-semibold uppercase tracking-wide text-foreground ${
                            index === 0 ? "bg-secondary" : ""
                        }`}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
        </div>
    );
}

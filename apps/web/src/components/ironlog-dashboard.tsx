import { api } from "@project-construction/backend/convex/_generated/api";
import { Button } from "@project-construction/ui/components/button";
import { Input } from "@project-construction/ui/components/input";
import { Label } from "@project-construction/ui/components/label";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";

/* ── Status config ── */
type EqStatus = "Available" | "Deployed" | "Under Maintenance" | "Decommissioned";

const statusConfig: Record<
  EqStatus,
  { label: string; badge: string; dot: string }
> = {
  Available: {
    label: "Available",
    badge: "border-blue-400/30 bg-blue-900/30 text-blue-300",
    dot: "bg-blue-400",
  },
  Deployed: {
    label: "Deployed",
    badge: "border-green-400/30 bg-green-900/30 text-green-300",
    dot: "bg-green-400",
  },
  "Under Maintenance": {
    label: "Maintenance",
    badge: "border-yellow-400/30 bg-yellow-900/30 text-yellow-300",
    dot: "bg-yellow-400",
  },
  Decommissioned: {
    label: "Offline",
    badge: "border-red-400/30 bg-red-900/30 text-red-300",
    dot: "bg-red-400",
  },
};

/* ── Add Equipment Form ── */
function AddEquipmentForm({ onClose }: { onClose: () => void }) {
  const register = useMutation(api.equipment.register);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parsed = z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      serialNumber: z.string().min(1, "Serial number is required"),
      acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    }).safeParse({ name, type, serialNumber, acquisitionDate });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      setSubmitting(false);
      return;
    }

    try {
      await register({
        name,
        type,
        serialNumber,
        acquisitionDate,
        status: "Available",
      });
      toast.success(`${name} registered successfully`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register equipment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="border border-border bg-card p-6 w-full max-w-md">
        <h2 className="il-display text-xl text-foreground mb-4">Register Equipment</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Equipment Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" placeholder="Caterpillar 320" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Type</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} className="h-10" placeholder="Excavator" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Serial Number</Label>
            <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="h-10" placeholder="CAT-2024-00142" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Acquisition Date</Label>
            <Input type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} className="h-10" />
          </div>
          <div className="flex gap-3 mt-2">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Dashboard ── */
export default function IronLogDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("All status");
  const [siteFilter, setSiteFilter] = useState<string>("All sites");
  const [showAddEquipment, setShowAddEquipment] = useState(false);

  const user = useQuery(api.auth.getCurrentUser);
  const userRole = useQuery(api.rbac.getCurrentRole);
  const equipmentList = useQuery(api.equipment.list, {
    status: statusFilter !== "All status" ? (statusFilter as EqStatus) : undefined,
  });
  const sites = useQuery(api.sites.list, {});
  const activityLogs = useQuery(api.equipment.listAllActivityLogs);

  const canWrite = userRole === "Admin" || userRole === "Fleet Manager";
  const canAssign = canWrite || userRole === "Site Supervisor";

  // Build site name lookup for assignments
  const siteMap = new Map(sites?.map((s) => [s._id, s.name]) ?? []);

  // Get site for each equipment (need assignments)
  const assignments = useQuery(api.assignments.listActive);

  const eqSiteMap = new Map<string, string>();
  for (const a of assignments ?? []) {
    const siteName = siteMap.get(a.siteId);
    if (siteName) eqSiteMap.set(a.equipmentId, siteName);
  }

  const filteredEquipment = equipmentList?.filter((eq) => {
    if (siteFilter !== "All sites") {
      const eqSite = eqSiteMap.get(eq._id);
      if (eqSite !== siteFilter) return false;
    }
    return true;
  });

  const statusFilters: string[] = ["All status", "Available", "Deployed", "Under Maintenance", "Decommissioned"];
  const siteFilters = ["All sites", ...(sites?.map((s) => s.name) ?? [])];

  return (
    <div className="grid min-h-full grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="hidden flex-col border-r border-border bg-card lg:flex">
        <div className="px-4 py-4">
          <div className="il-section-label">Navigation</div>
        </div>
        <nav className="flex flex-col gap-2 px-2">
          <a href="#equipment" className="il-touch flex items-center justify-between gap-3 border border-transparent px-3 py-2 text-sm font-medium uppercase tracking-wide bg-secondary text-foreground">
            <span>Equipment</span>
            <span>1</span>
          </a>
          <a href="#audit" className="il-touch flex items-center justify-between gap-3 border border-transparent px-3 py-2 text-sm font-medium uppercase tracking-wide hover:bg-secondary text-foreground">
            <span>Audit Log</span>
            <span>2</span>
          </a>
          <a href="#map" className="il-touch flex items-center justify-between gap-3 border border-transparent px-3 py-2 text-sm font-medium uppercase tracking-wide hover:bg-secondary text-foreground">
            <span>Map</span>
            <span>3</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-border px-4 py-4 text-sm text-muted-foreground">
          <UserMenu />
        </div>
      </aside>

      <main className="flex flex-col gap-6 px-4 py-6 pb-24 lg:px-8">
        <section className="flex flex-col gap-2">
          <span className="il-section-label">Field Ops Dashboard</span>
          <h1 className="il-display text-2xl text-foreground">
            IronLog Equipment Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            {equipmentList
              ? `${equipmentList.length} equipment on record`
              : "Loading..."}
            {userRole ? ` · Logged in as ${userRole}` : ""}
          </p>
        </section>

        <section id="equipment" className="flex flex-col gap-4 scroll-mt-24">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="il-display text-xl">Equipment List</h2>
              <p className="text-sm text-muted-foreground">
                Monitor active units, operators, and key checkout times.
              </p>
            </div>
            {canWrite && (
              <Button onClick={() => setShowAddEquipment(true)} className="il-touch">
                + Register Equipment
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 border border-border bg-card px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="il-section-label">Status</span>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "secondary" : "outline"}
                    className="il-touch h-10 px-3 text-xs"
                    onClick={() => setStatusFilter(filter)}
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
                    variant={siteFilter === filter ? "secondary" : "outline"}
                    className="il-touch h-10 px-3 text-xs"
                    onClick={() => setSiteFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {!filteredEquipment ? (
            <div className="border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Loading equipment...
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No equipment found.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredEquipment.map((eq) => {
                const status = statusConfig[eq.status as EqStatus] ?? statusConfig.Available;
                const assignedSite = eqSiteMap.get(eq._id) ?? "Unassigned";
                return (
                  <article
                    key={eq._id}
                    className="flex flex-col gap-4 border border-border bg-card px-4 py-4 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="il-eq-id text-xs text-muted-foreground">
                          {eq.serialNumber}
                        </span>
                        <h3 className="il-display text-lg text-foreground">
                          {eq.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">{eq.type}</span>
                      </div>
                      <span className={`flex items-center gap-2 border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${status.badge}`}>
                        <span className={`il-status-dot h-2 w-2 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Assigned site</span>
                        <span className="text-foreground">{assignedSite}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Key status</span>
                        <span className="text-foreground">{eq.keyStatus}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        Acquired {eq.acquisitionDate}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="map" className="flex flex-col gap-3 scroll-mt-24">
          <div>
            <h3 className="il-display text-lg">Site Map</h3>
            <p className="text-sm text-muted-foreground">
              {sites ? `${sites.filter((s) => s.status === "Active").length} active sites` : "Loading..."}
            </p>
          </div>
          <div className="relative h-72 w-full overflow-hidden border border-border bg-[#1a2020]">
            <div className="absolute left-3 top-3 text-sm uppercase tracking-widest text-muted-foreground">
              Map — {sites?.filter((s) => s.status === "Active").length ?? 0} sites
            </div>
            {(() => {
              const activeSites = sites?.filter((s) => s.status === "Active") ?? [];
              if (activeSites.length === 0) return null;
              const lats = activeSites.map((s) => s.coordinates.lat);
              const lngs = activeSites.map((s) => s.coordinates.lng);
              const minLat = Math.min(...lats);
              const maxLat = Math.max(...lats);
              const minLng = Math.min(...lngs);
              const maxLng = Math.max(...lngs);
              const latRange = maxLat - minLat || 0.5;
              const lngRange = maxLng - minLng || 0.5;
              const padLat = latRange * 0.25;
              const padLng = lngRange * 0.25;
              return activeSites.map((site) => {
                const left = `${((site.coordinates.lng - minLng + padLng) / (lngRange + 2 * padLng)) * 100}%`;
                const top = `${((maxLat + padLat - site.coordinates.lat) / (latRange + 2 * padLat)) * 100}%`;
                return (
                  <div
                    key={site._id}
                    className="absolute flex items-center gap-2"
                    style={{ left, top }}
                  >
                    <span className="il-map-pin flex items-center justify-center border border-border bg-card px-2 py-1 text-xs font-semibold">
                      {site.name}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        <section id="audit" className="flex flex-col gap-4 scroll-mt-24">
          <h2 className="il-display text-xl">Recent Activity</h2>
          {activityLogs && activityLogs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {activityLogs.slice(0, 10).map((log) => (
                <article
                  key={log._id}
                  className="flex flex-col gap-2 border border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">
                      {log.performedBy}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {log.action} {log.details ?? ""}
                    </span>
                  </div>
                  <div className="il-timestamp text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No activity yet.
            </div>
          )}
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-card px-2 py-2 lg:hidden">
        <a href="#equipment" className="il-touch flex-1 text-center text-sm font-semibold uppercase tracking-wide">
          Equipment
        </a>
        <a href="#audit" className="il-touch flex-1 text-center text-sm font-semibold uppercase tracking-wide">
          Audit
        </a>
        <a href="#map" className="il-touch flex-1 text-center text-sm font-semibold uppercase tracking-wide">
          Map
        </a>
      </nav>

      {showAddEquipment && <AddEquipmentForm onClose={() => setShowAddEquipment(false)} />}
    </div>
  );
}
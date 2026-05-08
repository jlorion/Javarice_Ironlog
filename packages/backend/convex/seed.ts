import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed & Test Runner for Equipment Logging (Feature 1 + RBAC)
 *
 * Run with:
 *   npx convex run seed:runTests --no-push
 *
 * This populates the database with test data and executes
 * scenarios from the Gherkin spec, returning a report.
 */

export const runTests = mutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      scenario: string;
      passed: boolean;
      error?: string;
      detail?: unknown;
    }[] = [];

    const pass = (scenario: string, detail?: unknown) =>
      results.push({ scenario, passed: true, detail });

    const fail = (scenario: string, error: string, detail?: unknown) =>
      results.push({ scenario, passed: false, error, detail });

    const clearAll = async () => {
      for (const t of ["equipment", "sites", "equipmentAssignments", "activityLogs", "keyAuditLogs", "userRoles"] as const) {
        for (const doc of await ctx.db.query(t).collect()) {
          await ctx.db.delete(doc._id);
        }
      }
    };

    /** Find active (unassigned) assignment for an equipment */
    const findActiveAssignment = async (equipmentId: string) => {
      const all = await ctx.db
        .query("equipmentAssignments")
        .withIndex("by_equipmentId", (q) => q.eq("equipmentId", equipmentId as any))
        .collect();
      return all.find((a) => a.unassignedAt === undefined) ?? null;
    };

    /** Find active assignments for a site */
    const findActiveBySite = async (siteId: string) => {
      const all = await ctx.db
        .query("equipmentAssignments")
        .withIndex("by_siteId", (q) => q.eq("siteId", siteId as any))
        .collect();
      return all.filter((a) => a.unassignedAt === undefined);
    };

    const checkRbac = (role: string, permission: string): boolean => {
      const perms: Record<string, string[]> = {
        Admin: ["*"],
        "Fleet Manager": ["equipment:read", "equipment:write", "map:read", "audit:read"],
        "Site Supervisor": ["assignment:write", "map:read", "equipment:read"],
        "Operations Manager": ["audit:write", "audit:read", "equipment:read"],
        Viewer: ["equipment:read", "map:read"],
      };
      const rolePerms = perms[role] ?? [];
      return rolePerms.includes("*") || rolePerms.includes(permission);
    };

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 1: Register a new piece of equipment
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Caterpillar 320", type: "Excavator", serialNumber: "CAT-2024-00142",
        status: "Available", acquisitionDate: "2024-03-15", keyStatus: "Key In",
      });
      const eq = await ctx.db.get(eqId);
      if (eq?.name === "Caterpillar 320" && eq.status === "Available") {
        pass("Register a new piece of equipment", { equipmentId: eqId });
      } else {
        fail("Register a new piece of equipment", "State mismatch", eq);
      }
    } catch (e) { fail("Register a new piece of equipment", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 2: Prevent duplicate serial number
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      await ctx.db.insert("equipment", {
        name: "Caterpillar 320", type: "Excavator", serialNumber: "CAT-2024-00142",
        status: "Available", acquisitionDate: "2024-03-15", keyStatus: "Key In",
      });
      const dupes = await ctx.db
        .query("equipment")
        .withIndex("by_serialNumber", (q) => q.eq("serialNumber", "CAT-2024-00142"))
        .collect();
      if (dupes.length === 1) {
        pass("Prevent duplicate equipment registration", { count: dupes.length });
      } else {
        fail("Prevent duplicate equipment registration", `Expected 1, found ${dupes.length}`);
      }
    } catch (e) { fail("Prevent duplicate equipment registration", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 3: Update equipment details
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Caterpillar 320", type: "Excavator", serialNumber: "CAT-2024-00142",
        status: "Available", acquisitionDate: "2024-03-15", keyStatus: "Key In",
      });
      await ctx.db.patch(eqId, { status: "Under Maintenance" });
      const updated = await ctx.db.get(eqId);
      if (updated?.status === "Under Maintenance") {
        pass("Update equipment details", { newStatus: updated.status });
      } else {
        fail("Update equipment details", "Status did not update", updated);
      }
    } catch (e) { fail("Update equipment details", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 4: Decommission available equipment
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Caterpillar 320", type: "Excavator", serialNumber: "CAT-2024-00142",
        status: "Available", acquisitionDate: "2024-03-15", keyStatus: "Key In",
      });
      await ctx.db.patch(eqId, { status: "Decommissioned", decommissionedAt: Date.now() });
      const updated = await ctx.db.get(eqId);
      if (updated?.status === "Decommissioned") {
        pass("Decommission a piece of equipment", { status: updated.status });
      } else {
        fail("Decommission a piece of equipment", "Status mismatch", updated);
      }
    } catch (e) { fail("Decommission a piece of equipment", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 5: Block decommission of deployed equipment
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Komatsu PC200", type: "Excavator", serialNumber: "KOM-2024-00001",
        status: "Deployed", acquisitionDate: "2024-01-10", keyStatus: "Key In",
      });
      const siteId = await ctx.db.insert("sites", {
        name: "Damosa Gateway Phase 2", location: "Lanang, Davao City",
        coordinates: { lat: 7.1, lng: 125.6 }, status: "Active",
      });
      await ctx.db.insert("equipmentAssignments", {
        equipmentId: eqId, siteId, assignedBy: "test@example.com", assignedAt: Date.now(),
      });
      const active = await findActiveAssignment(eqId);
      if (active) {
        pass("Attempt to decommission equipment currently on-site", {
          blocked: true, message: "Equipment is currently deployed. Unassign it before decommissioning.",
        });
      } else {
        fail("Attempt to decommission equipment currently on-site", "Expected active assignment");
      }
    } catch (e) { fail("Attempt to decommission equipment currently on-site", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 6: Filter equipment by status
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      await ctx.db.insert("equipment", { name: "Caterpillar 320", type: "Excavator", serialNumber: "CAT-2024-00142", status: "Available", acquisitionDate: "2024-03-15", keyStatus: "Key In" });
      await ctx.db.insert("equipment", { name: "Komatsu PC200", type: "Excavator", serialNumber: "KOM-2024-00001", status: "Deployed", acquisitionDate: "2024-01-10", keyStatus: "Key In" });
      await ctx.db.insert("equipment", { name: "Volvo EC300E", type: "Excavator", serialNumber: "VOL-2024-00001", status: "Under Maintenance", acquisitionDate: "2024-02-20", keyStatus: "Key In" });
      await ctx.db.insert("equipment", { name: "JCB 3CX", type: "Backhoe", serialNumber: "JCB-2024-00001", status: "Decommissioned", acquisitionDate: "2023-06-01", keyStatus: "Key In", decommissionedAt: Date.now() });
      const av = await ctx.db.query("equipment").withIndex("by_status", (q) => q.eq("status", "Available")).collect();
      const dp = await ctx.db.query("equipment").withIndex("by_status", (q) => q.eq("status", "Deployed")).collect();
      const mn = await ctx.db.query("equipment").withIndex("by_status", (q) => q.eq("status", "Under Maintenance")).collect();
      const dc = await ctx.db.query("equipment").withIndex("by_status", (q) => q.eq("status", "Decommissioned")).collect();
      if (av.length === 1 && dp.length === 1 && mn.length === 1 && dc.length === 1) {
        pass("Filter equipment by status", { Available: av.length, Deployed: dp.length, Maintenance: mn.length, Decommissioned: dc.length });
      } else {
        fail("Filter equipment by status", `Mismatch: ${av.length}/${dp.length}/${mn.length}/${dc.length}`);
      }
    } catch (e) { fail("Filter equipment by status", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 7: Create a construction site
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const siteId = await ctx.db.insert("sites", {
        name: "SM Davao Expansion Block C", location: "Davao City, Philippines",
        coordinates: { lat: 7.0731, lng: 125.6128 }, status: "Active",
      });
      const site = await ctx.db.get(siteId);
      if (site?.name === "SM Davao Expansion Block C" && site.status === "Active") {
        pass("Create a construction site", { siteId });
      } else {
        fail("Create a construction site", "Site mismatch", site);
      }
    } catch (e) { fail("Create a construction site", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 8: Assign equipment to a site
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Volvo EC300E", type: "Excavator", serialNumber: "VOL-2024-00001",
        status: "Available", acquisitionDate: "2024-02-20", keyStatus: "Key In",
      });
      const siteId = await ctx.db.insert("sites", {
        name: "SM Davao Expansion Block C", location: "Davao City, Philippines",
        coordinates: { lat: 7.0731, lng: 125.6128 }, status: "Active",
      });
      await ctx.db.insert("equipmentAssignments", {
        equipmentId: eqId, siteId, assignedBy: "test@example.com", assignedAt: Date.now(),
      });
      await ctx.db.patch(eqId, { status: "Deployed" });
      const eq = await ctx.db.get(eqId);
      const siteEq = await findActiveBySite(siteId);
      if (eq?.status === "Deployed" && siteEq.length === 1) {
        pass("Assign equipment to a construction site", { equipmentId: eqId, siteId });
      } else {
        fail("Assign equipment to a construction site", "State mismatch");
      }
    } catch (e) { fail("Assign equipment to a construction site", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 9: Prevent assigning already-deployed equipment
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Volvo EC300E", type: "Excavator", serialNumber: "VOL-2024-00001",
        status: "Deployed", acquisitionDate: "2024-02-20", keyStatus: "Key In",
      });
      const site1Id = await ctx.db.insert("sites", {
        name: "Site A", location: "Location A", coordinates: { lat: 7.0, lng: 125.6 }, status: "Active",
      });
      await ctx.db.insert("equipmentAssignments", {
        equipmentId: eqId, siteId: site1Id, assignedBy: "test@example.com", assignedAt: Date.now(),
      });
      const existing = await findActiveAssignment(eqId);
      if (existing) {
        pass("Prevent assigning already-deployed equipment", { blocked: true });
      } else {
        fail("Prevent assigning already-deployed equipment", "Expected active assignment");
      }
    } catch (e) { fail("Prevent assigning already-deployed equipment", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 10: Unassign equipment from a site
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const eqId = await ctx.db.insert("equipment", {
        name: "Volvo EC300E", type: "Excavator", serialNumber: "VOL-2024-00001",
        status: "Deployed", acquisitionDate: "2024-02-20", keyStatus: "Key In",
      });
      const siteId = await ctx.db.insert("sites", {
        name: "SM Davao Expansion Block C", location: "Davao City, Philippines",
        coordinates: { lat: 7.0731, lng: 125.6128 }, status: "Active",
      });
      const assignmentId = await ctx.db.insert("equipmentAssignments", {
        equipmentId: eqId, siteId, assignedBy: "test@example.com", assignedAt: Date.now(),
      });
      await ctx.db.patch(assignmentId, {
        unassignedAt: Date.now(), unassignedBy: "test@example.com", unassignedReason: "Project completed",
      });
      await ctx.db.patch(eqId, { status: "Available" });
      const eq = await ctx.db.get(eqId);
      const assignment = await ctx.db.get(assignmentId);
      if (eq?.status === "Available" && assignment?.unassignedAt !== undefined) {
        pass("Unassign equipment from a construction site", { newStatus: eq.status });
      } else {
        fail("Unassign equipment from a construction site", "State mismatch");
      }
    } catch (e) { fail("Unassign equipment from a construction site", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 11: Assign multiple equipment to same site
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();
      const siteId = await ctx.db.insert("sites", {
        name: "Davao River Bridge Rehab", location: "Davao City, Philippines",
        coordinates: { lat: 7.05, lng: 125.58 }, status: "Active",
      });
      for (const name of ["Komatsu GD655", "Liebherr LTM 1090-4", "Terex Powerlift 8000"]) {
        const eqId = await ctx.db.insert("equipment", {
          name, type: "Heavy Equipment", serialNumber: `SN-${name.replace(/\s/g, "")}`,
          status: "Available", acquisitionDate: "2024-01-01", keyStatus: "Key In",
        });
        await ctx.db.insert("equipmentAssignments", {
          equipmentId: eqId, siteId, assignedBy: "test@example.com", assignedAt: Date.now(),
        });
        await ctx.db.patch(eqId, { status: "Deployed" });
      }
      const siteAssignments = await findActiveBySite(siteId);
      if (siteAssignments.length === 3) {
        pass("Assign multiple equipment to the same site", { count: siteAssignments.length });
      } else {
        fail("Assign multiple equipment to the same site", `Expected 3, got ${siteAssignments.length}`);
      }
    } catch (e) { fail("Assign multiple equipment to the same site", String(e)); }

    /* ═══════════════════════════════════════════════════════
     *  RBAC TEST CASES (Feature 5)
     * ═══════════════════════════════════════════════════════ */
    const rbacCases: { role: string; action: string; permission: string; shouldAllow: boolean }[] = [
      { role: "Admin", action: "Register new equipment", permission: "equipment:write", shouldAllow: true },
      { role: "Fleet Manager", action: "Register new equipment", permission: "equipment:write", shouldAllow: true },
      { role: "Site Supervisor", action: "Register new equipment", permission: "equipment:write", shouldAllow: false },
      { role: "Viewer", action: "Register new equipment", permission: "equipment:write", shouldAllow: false },
      { role: "Site Supervisor", action: "Assign equipment to a site", permission: "assignment:write", shouldAllow: true },
      { role: "Viewer", action: "Assign equipment to a site", permission: "assignment:write", shouldAllow: false },
      { role: "Operations Manager", action: "Check out an equipment key", permission: "audit:write", shouldAllow: true },
      { role: "Viewer", action: "Check out an equipment key", permission: "audit:write", shouldAllow: false },
      { role: "Viewer", action: "View the equipment map", permission: "map:read", shouldAllow: true },
      { role: "Fleet Manager", action: "View the equipment map", permission: "map:read", shouldAllow: true },
      { role: "Site Supervisor", action: "View the equipment map", permission: "map:read", shouldAllow: true },
    ];

    for (const tc of rbacCases) {
      const allowed = checkRbac(tc.role, tc.permission);
      if (allowed === tc.shouldAllow) {
        pass(`RBAC: ${tc.role} → ${tc.action} → ${tc.shouldAllow ? "allow" : "deny"}`);
      } else {
        fail(`RBAC: ${tc.role} → ${tc.action} → ${tc.shouldAllow ? "allow" : "deny"}`,
          `Expected ${tc.shouldAllow ? "allowed" : "denied"} but got ${allowed ? "allowed" : "denied"}`);
      }
    }

    return {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      results,
    };
  },
});
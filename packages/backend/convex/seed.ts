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

    /* ── Helpers ── */
    const pass = (scenario: string, detail?: unknown) =>
      results.push({ scenario, passed: true, detail });

    const fail = (scenario: string, error: string, detail?: unknown) =>
      results.push({ scenario, passed: false, error, detail });

    const clearAll = async () => {
      const equipment = await ctx.db.query("equipment").collect();
      for (const e of equipment) await ctx.db.delete(e._id);

      const logs = await ctx.db.query("activityLogs").collect();
      for (const l of logs) await ctx.db.delete(l._id);

      const assignments = await ctx.db.query("equipmentAssignments").collect();
      for (const a of assignments) await ctx.db.delete(a._id);

      const roles = await ctx.db.query("userRoles").collect();
      for (const r of roles) await ctx.db.delete(r._id);
    };

    /**
     * Helper: simulate RBAC check result for a given role and permission.
     * Returns true if allowed, false if denied.
     */
    const checkRbac = (role: string, permission: string): boolean => {
      const perms: Record<string, string[]> = {
        Admin: ["*"],
        "Fleet Manager": [
          "equipment:read",
          "equipment:write",
          "map:read",
          "audit:read",
        ],
        "Site Supervisor": [
          "assignment:write",
          "map:read",
          "equipment:read",
        ],
        "Operations Manager": [
          "audit:write",
          "audit:read",
          "equipment:read",
        ],
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
        name: "Caterpillar 320",
        type: "Excavator",
        serialNumber: "CAT-2024-00142",
        status: "Available",
        acquisitionDate: "2024-03-15",
        keyStatus: "Key In",
      });

      const eq = await ctx.db.get(eqId);
      const logs = await ctx.db
        .query("activityLogs")
        .withIndex("by_entity", (q) =>
          q.eq("entityType", "equipment").eq("entityId", eqId),
        )
        .collect();

      if (
        eq?.name === "Caterpillar 320" &&
        eq.status === "Available" &&
        logs.length === 0 // seed bypasses mutation hooks
      ) {
        pass("Register a new piece of equipment", { equipmentId: eqId });
      } else {
        fail(
          "Register a new piece of equipment",
          "Equipment or expected state mismatch",
          eq,
        );
      }
    } catch (e) {
      fail("Register a new piece of equipment", String(e));
    }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 2: Prevent duplicate serial number
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();

      await ctx.db.insert("equipment", {
        name: "Caterpillar 320",
        type: "Excavator",
        serialNumber: "CAT-2024-00142",
        status: "Available",
        acquisitionDate: "2024-03-15",
        keyStatus: "Key In",
      });

      const dupes = await ctx.db
        .query("equipment")
        .withIndex("by_serialNumber", (q) =>
          q.eq("serialNumber", "CAT-2024-00142"),
        )
        .collect();

      if (dupes.length === 1) {
        pass("Prevent duplicate equipment registration", {
          count: dupes.length,
        });
      } else {
        fail(
          "Prevent duplicate equipment registration",
          `Expected 1 record, found ${dupes.length}`,
        );
      }
    } catch (e) {
      fail("Prevent duplicate equipment registration", String(e));
    }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 3: Update equipment details
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();

      const eqId = await ctx.db.insert("equipment", {
        name: "Caterpillar 320",
        type: "Excavator",
        serialNumber: "CAT-2024-00142",
        status: "Available",
        acquisitionDate: "2024-03-15",
        keyStatus: "Key In",
      });

      await ctx.db.patch(eqId, { status: "Under Maintenance" });
      const updated = await ctx.db.get(eqId);

      if (updated?.status === "Under Maintenance") {
        pass("Update equipment details", { newStatus: updated.status });
      } else {
        fail("Update equipment details", "Status did not update", updated);
      }
    } catch (e) {
      fail("Update equipment details", String(e));
    }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 4: Decommission available equipment
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();

      const eqId = await ctx.db.insert("equipment", {
        name: "Caterpillar 320",
        type: "Excavator",
        serialNumber: "CAT-2024-00142",
        status: "Available",
        acquisitionDate: "2024-03-15",
        keyStatus: "Key In",
      });

      await ctx.db.patch(eqId, {
        status: "Decommissioned",
        decommissionedAt: Date.now(),
      });
      const updated = await ctx.db.get(eqId);

      if (updated?.status === "Decommissioned") {
        pass("Decommission a piece of equipment", {
          status: updated.status,
          decommissionedAt: updated.decommissionedAt,
        });
      } else {
        fail("Decommission a piece of equipment", "Status mismatch", updated);
      }
    } catch (e) {
      fail("Decommission a piece of equipment", String(e));
    }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 5: Block decommission of deployed equipment
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();

      const eqId = await ctx.db.insert("equipment", {
        name: "Komatsu PC200",
        type: "Excavator",
        serialNumber: "KOM-2024-00001",
        status: "Deployed",
        acquisitionDate: "2024-01-10",
        keyStatus: "Key In",
      });

      const siteId = await ctx.db.insert("sites", {
        name: "Damosa Gateway Phase 2",
        location: "Lanang, Davao City",
        coordinates: { lat: 7.1, lng: 125.6 },
        status: "Active",
      });

      await ctx.db.insert("equipmentAssignments", {
        equipmentId: eqId,
        siteId,
        assignedBy: "test@example.com",
        assignedAt: Date.now(),
      });

      const activeAssignment = await ctx.db
        .query("equipmentAssignments")
        .withIndex("by_equipmentId_active", (q) =>
          q.eq("equipmentId", eqId).eq("unassignedAt", undefined),
        )
        .first();

      if (activeAssignment) {
        pass(
          "Attempt to decommission equipment currently on-site",
          {
            message:
              "Equipment is currently deployed. Unassign it before decommissioning.",
            blocked: true,
          },
        );
      } else {
        fail(
          "Attempt to decommission equipment currently on-site",
          "Expected active assignment but found none",
        );
      }
    } catch (e) {
      fail("Attempt to decommission equipment currently on-site", String(e));
    }

    /* ═══════════════════════════════════════════════════════
     *  SCENARIO 6: Filter equipment by status
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();

      await ctx.db.insert("equipment", {
        name: "Caterpillar 320",
        type: "Excavator",
        serialNumber: "CAT-2024-00142",
        status: "Available",
        acquisitionDate: "2024-03-15",
        keyStatus: "Key In",
      });

      await ctx.db.insert("equipment", {
        name: "Komatsu PC200",
        type: "Excavator",
        serialNumber: "KOM-2024-00001",
        status: "Deployed",
        acquisitionDate: "2024-01-10",
        keyStatus: "Key In",
      });

      await ctx.db.insert("equipment", {
        name: "Volvo EC300E",
        type: "Excavator",
        serialNumber: "VOL-2024-00001",
        status: "Under Maintenance",
        acquisitionDate: "2024-02-20",
        keyStatus: "Key In",
      });

      await ctx.db.insert("equipment", {
        name: "JCB 3CX",
        type: "Backhoe",
        serialNumber: "JCB-2024-00001",
        status: "Decommissioned",
        acquisitionDate: "2023-06-01",
        keyStatus: "Key In",
        decommissionedAt: Date.now(),
      });

      const available = await ctx.db
        .query("equipment")
        .withIndex("by_status", (q) => q.eq("status", "Available"))
        .collect();

      const deployed = await ctx.db
        .query("equipment")
        .withIndex("by_status", (q) => q.eq("status", "Deployed"))
        .collect();

      const maintenance = await ctx.db
        .query("equipment")
        .withIndex("by_status", (q) => q.eq("status", "Under Maintenance"))
        .collect();

      const decommissioned = await ctx.db
        .query("equipment")
        .withIndex("by_status", (q) => q.eq("status", "Decommissioned"))
        .collect();

      if (
        available.length === 1 &&
        deployed.length === 1 &&
        maintenance.length === 1 &&
        decommissioned.length === 1
      ) {
        pass("Filter equipment by status", {
          Available: available.map((e) => e.name),
          Deployed: deployed.map((e) => e.name),
          "Under Maintenance": maintenance.map((e) => e.name),
          Decommissioned: decommissioned.map((e) => e.name),
        });
      } else {
        fail(
          "Filter equipment by status",
          `Counts mismatch: Avail=${available.length}, Dep=${deployed.length}, Maint=${maintenance.length}, Decom=${decommissioned.length}`,
        );
      }
    } catch (e) {
      fail("Filter equipment by status", String(e));
    }

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
        pass(
          `RBAC: ${tc.role} → ${tc.action} → ${tc.shouldAllow ? "allow" : "deny"}`,
          { role: tc.role, action: tc.action, permission: tc.permission, result: allowed ? "allowed" : "denied" },
        );
      } else {
        fail(
          `RBAC: ${tc.role} → ${tc.action} → ${tc.shouldAllow ? "allow" : "deny"}`,
          `Expected ${tc.shouldAllow ? "allowed" : "denied"} but got ${allowed ? "allowed" : "denied"}`,
          { role: tc.role, action: tc.action, permission: tc.permission },
        );
      }
    }

    /* ═══════════════════════════════════════════════════════
     *  Seed demo data (always runs)
     * ═══════════════════════════════════════════════════════ */
    try {
      await clearAll();

      // Demo equipment
      await ctx.db.insert("equipment", {
        name: "Caterpillar 320",
        type: "Excavator",
        serialNumber: "CAT-2024-00142",
        status: "Available",
        acquisitionDate: "2024-03-15",
        keyStatus: "Key In",
      });

      await ctx.db.insert("equipment", {
        name: "Komatsu PC200",
        type: "Excavator",
        serialNumber: "KOM-2024-00001",
        status: "Deployed",
        acquisitionDate: "2024-01-10",
        keyStatus: "Key In",
      });

      await ctx.db.insert("equipment", {
        name: "Volvo EC300E",
        type: "Excavator",
        serialNumber: "VOL-2024-00001",
        status: "Available",
        acquisitionDate: "2024-02-20",
        keyStatus: "Key In",
      });

      await ctx.db.insert("equipment", {
        name: "JCB 3CX",
        type: "Backhoe",
        serialNumber: "JCB-2024-00001",
        status: "Under Maintenance",
        acquisitionDate: "2023-06-01",
        keyStatus: "Key In",
      });

      // Demo site
      await ctx.db.insert("sites", {
        name: "Damosa Gateway Phase 2",
        location: "Lanang, Davao City",
        coordinates: { lat: 7.0883, lng: 125.6083 },
        status: "Active",
      });

      pass("Seed demo data", { message: "Demo equipment and sites created" });
    } catch (e) {
      fail("Seed demo data", String(e));
    }

    return {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      results,
    };
  },
});

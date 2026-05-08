# Equipment Logging + RBAC — Test Cases & Expected Behavior

## How to Run Tests

```bash
# Run the automated test suite + seed demo data
cd packages/backend && npx convex run seed:runTests --no-push
```

## Manual API Testing (via Convex Dashboard or curl)

```bash
# List all equipment
curl https://<your-deployment>.convex.site/api/equipment/list

# Register equipment (requires auth cookie from login)
curl -X POST https://<your-deployment>.convex.site/api/equipment/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Caterpillar 320","type":"Excavator","serialNumber":"CAT-2024-00142","acquisitionDate":"2024-03-15"}'

# Update equipment
curl -X POST https://<your-deployment>.convex.site/api/equipment/update \
  -H "Content-Type: application/json" \
  -d '{"equipmentId":"...","status":"Under Maintenance"}'

# Decommission
curl -X POST https://<your-deployment>.convex.site/api/equipment/decommission \
  -H "Content-Type: application/json" \
  -d '{"equipmentId":"..."}'
```

---

## Test Case Matrix

### TC-1: Register a new piece of equipment
| Field | Value |
|-------|-------|
| **Function** | `equipment.register` |
| **Input** | `{ name: "Caterpillar 320", type: "Excavator", serialNumber: "CAT-2024-00142", status: "Available", acquisitionDate: "2024-03-15" }` |
| **Expected Result** | Returns `equipmentId`. Record exists with `status: "Available"`, `keyStatus: "Key In"`. Activity log entry created. |
| **Edge Cases** | Missing required fields → Convex arg validation rejects. Invalid date format → client-side Zod rejects before sending. |

### TC-2: Prevent duplicate serial number
| Field | Value |
|-------|-------|
| **Function** | `equipment.register` |
| **Precondition** | Equipment with `serialNumber: "CAT-2024-00142"` already exists. |
| **Input** | Same serial number as TC-1. |
| **Expected Result** | Throws: `Equipment with this serial number already exists: CAT-2024-00142`. No duplicate record created. |
| **Edge Cases** | Case-sensitive serial numbers ("cat-2024-00142" ≠ "CAT-2024-00142"). |

### TC-3: Update equipment details
| Field | Value |
|-------|-------|
| **Function** | `equipment.update` |
| **Precondition** | Equipment "Caterpillar 320" exists with `status: "Available"`. |
| **Input** | `{ equipmentId: "...", status: "Under Maintenance" }` |
| **Expected Result** | Record updated. Activity log entry created with `action: "updated"` and `details: "Updated fields: status"`. |
| **Edge Cases** | Invalid `equipmentId` → throws `Equipment not found`. Only provided fields are patched; others remain unchanged. |

### TC-4: Decommission available equipment
| Field | Value |
|-------|-------|
| **Function** | `equipment.decommission` |
| **Precondition** | Equipment exists with `status: "Available"` and no active assignment. |
| **Expected Result** | Status changed to `"Decommissioned"`. `decommissionedAt` timestamp set. Activity log entry created. |
| **Edge Cases** | Already decommissioned → still succeeds (idempotent). |

### TC-5: Block decommission of deployed equipment
| Field | Value |
|-------|-------|
| **Function** | `equipment.decommission` |
| **Precondition** | Equipment "Komatsu PC200" has active assignment to site "Damosa Gateway Phase 2". |
| **Expected Result** | Throws: `Equipment is currently deployed. Unassign it before decommissioning.` Status remains unchanged. |
| **Edge Cases** | Assignment exists but `unassignedAt` is set → should allow decommission. |

### TC-6: Filter equipment by status
| Field | Value |
|-------|-------|
| **Function** | `equipment.list` |
| **Input** | `{ status: "Available" }` (optional) |
| **Expected Result** | Returns only equipment matching the status. Sorted by `_creationTime` desc. |
| **Edge Cases** | No status filter → returns all equipment. Empty result → returns `[]`. |

### TC-7: Get equipment by ID
| Field | Value |
|-------|-------|
| **Function** | `equipment.getById` |
| **Input** | `{ equipmentId: "..." }` |
| **Expected Result** | Returns full equipment record or `null` if not found. |

### TC-8: Get activity log for equipment
| Field | Value |
|-------|-------|
| **Function** | `equipment.getActivityLog` |
| **Input** | `{ equipmentId: "..." }` |
| **Expected Result** | Returns activity logs sorted newest-first. Includes registration, updates, decommission events. |

---

## RBAC Test Cases (Feature 5)

### Permission Matrix

| Role | Permission | Equipment Register | Equipment Update | Equipment Decommission | Site Assign | Key Checkout | View Map | View Audit Log |
|------|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **Admin** | `*` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fleet Manager** | `equipment:write`, `equipment:read`, `map:read`, `audit:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Site Supervisor** | `assignment:write`, `map:read`, `equipment:read` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Operations Manager** | `audit:write`, `audit:read`, `equipment:read` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Viewer** | `equipment:read`, `map:read` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### TC-RBAC-1: Admin can register equipment
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Admin` in `userRoles` table. |
| **Action** | Call `equipment.register` |
| **Expected** | ✅ Succeeds. Equipment created. |

### TC-RBAC-2: Fleet Manager can register equipment
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Fleet Manager`. |
| **Action** | Call `equipment.register` |
| **Expected** | ✅ Succeeds. |

### TC-RBAC-3: Site Supervisor denied from registering equipment
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Site Supervisor`. |
| **Action** | Call `equipment.register` |
| **Expected** | ❌ Throws: `You do not have permission to perform this action`. No record created. |

### TC-RBAC-4: Viewer denied from registering equipment
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Viewer`. |
| **Action** | Call `equipment.register` |
| **Expected** | ❌ Throws: `You do not have permission to perform this action`. |

### TC-RBAC-5: Site Supervisor can assign equipment
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Site Supervisor`. |
| **Action** | Call `assignment.assign` (Phase 4) |
| **Expected** | ✅ Succeeds. |

### TC-RBAC-6: Viewer denied from assigning equipment
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Viewer`. |
| **Action** | Call `assignment.assign` |
| **Expected** | ❌ Throws: `You do not have permission to perform this action`. |

### TC-RBAC-7: Operations Manager can check out keys
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Operations Manager`. |
| **Action** | Call `audit.checkoutKey` (Phase 5) |
| **Expected** | ✅ Succeeds. |

### TC-RBAC-8: Viewer denied from checking out keys
| Field | Value |
|-------|-------|
| **Precondition** | User has role `Viewer`. |
| **Action** | Call `audit.checkoutKey` |
| **Expected** | ❌ Throws: `You do not have permission to perform this action`. |

### TC-RBAC-9: All roles can view equipment list
| Field | Value |
|-------|-------|
| **Action** | Call `equipment.list` |
| **Expected** | ✅ Succeeds for Admin, Fleet Manager, Site Supervisor, Operations Manager, Viewer. |

---

## Error Codes & Messages

| Scenario | Error Message | HTTP Status (via Convex) |
|----------|--------------|--------------------------|
| Duplicate serial | `Equipment with this serial number already exists: {serial}` | 500 (Convex runtime error) |
| Equipment not found | `Equipment not found: {id}` | 500 |
| Decommission blocked | `Equipment is currently deployed. Unassign it before decommissioning.` | 500 |
| Unauthenticated (register/update/decommission) | Better-auth middleware handles this | 401 |

> **Note:** Convex mutations return 500 for thrown errors. The frontend should catch these and surface user-friendly messages.

---

## Data Integrity Rules

1. **Serial Number Uniqueness**: Enforced at mutation level via index lookup. No database-level unique constraint (Convex limitation).
2. **Status Transitions**:
   - `Available → Deployed` (via site assignment)
   - `Available → Under Maintenance`
   - `Available → Decommissioned` (if not assigned)
   - `Deployed → Available` (via unassignment)
   - `Under Maintenance → Available`
   - `Decommissioned → *` (no transitions allowed; decommission is terminal)
3. **Decommission Guard**: Active `equipmentAssignments` record with `unassignedAt: undefined` blocks decommission.
4. **Activity Logging**: Every `register`, `update`, `decommission` creates an `activityLogs` entry with `category: "equipment"`.

---

## Frontend Integration Notes

```tsx
// Example: Register equipment form
import { useMutation, useQuery } from "convex/react";
import { api } from "@project-construction/backend/convex/_generated/api";

const register = useMutation(api.equipment.register);
const equipmentList = useQuery(api.equipment.list, { status: "Available" });

// Call mutation
await register({
  name: "Caterpillar 320",
  type: "Excavator",
  serialNumber: "CAT-2024-00142",
  acquisitionDate: "2024-03-15",
});
```

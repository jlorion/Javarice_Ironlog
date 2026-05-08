export type Role =
    | "Admin"
    | "FleetManager"
    | "SiteSupervisor"
    | "OperationsManager"
    | "Viewer";

export type Action =
    | "registerEquipment"
    | "updateEquipment"
    | "assignEquipment"
    | "checkOutKey"
    | "viewAuditLog"
    | "exportAuditLog"
    | "viewEquipment"
    | "viewMap";

export const PERMISSIONS: Record<Role, Action[]> = {
    Admin: [
        "registerEquipment",
        "updateEquipment",
        "assignEquipment",
        "checkOutKey",
        "viewAuditLog",
        "exportAuditLog",
        "viewEquipment",
        "viewMap",
    ],
    FleetManager: [
        "registerEquipment",
        "updateEquipment",
        "viewAuditLog",
        "viewEquipment",
        "viewMap",
    ],
    SiteSupervisor: ["assignEquipment", "viewEquipment", "viewMap"],
    OperationsManager: [
        "checkOutKey",
        "viewAuditLog",
        "exportAuditLog",
        "viewEquipment",
        "viewMap",
    ],
    Viewer: ["viewEquipment", "viewMap"],
};

export function can(role: Role, action: Action): boolean {
    return PERMISSIONS[role].includes(action);
}

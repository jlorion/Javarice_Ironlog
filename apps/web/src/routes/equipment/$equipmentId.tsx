import { api } from "@project-construction/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@project-construction/ui/components/button";
import { Input } from "@project-construction/ui/components/input";
import { Label } from "@project-construction/ui/components/label";
import { Badge } from "@project-construction/ui/components/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@project-construction/ui/components/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/equipment/$equipmentId")({
    component: EquipmentDetailPage,
});

function EquipmentDetailPage() {
    const { equipmentId } = Route.useParams();
    const navigate = useNavigate();
    const { role } = useAuth();

    const equipment = useQuery(api.equipment.getById, {
        equipmentId: equipmentId as any,
    });
    const updateEquipment = useMutation(api.equipment.update);
    const decommissionEquipment = useMutation(api.equipment.decommission);

    const [isReturnOpen, setIsReturnOpen] = useState(false);

    const editForm = useForm({
        defaultValues: {
            name: equipment?.name ?? "",
            type: equipment?.type ?? "",
            serialNumber: equipment?.serialNumber ?? "",
            status: (equipment?.status ?? "Available") as string,
            acquisitionDate: equipment?.acquisitionDate ?? "",
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(1, "Name is required"),
                type: z.string().min(1, "Type is required"),
                serialNumber: z.string().min(1, "Serial Number is required"),
                status: z.enum([
                    "Available",
                    "Deployed",
                    "Under Maintenance",
                    "Decommissioned",
                ]),
                acquisitionDate: z.string().refine((date) => {
                    return new Date(date) <= new Date();
                }, "Acquisition date cannot be in the future"),
            }),
        },
        onSubmit: async ({ value }) => {
            try {
                if (value.status === "Decommissioned") {
                    await decommissionEquipment({ equipmentId: equipmentId as any });
                } else {
                    await updateEquipment({
                        equipmentId: equipmentId as any,
                        name: value.name,
                        type: value.type,
                        serialNumber: value.serialNumber,
                        status: value.status as any,
                        acquisitionDate: value.acquisitionDate,
                    });
                }
                toast.success("Equipment updated successfully.");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to update equipment");
            }
        },
    });

    const handleReturnKey = async () => {
        try {
            await updateEquipment({
                equipmentId: equipmentId as any,
                // Return key is just a status update — key status tracked via keyAuditLogs
            });
            toast.success("Key returned successfully.");
            setIsReturnOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to return key");
        }
    };

    if (!equipment) {
        return <div className="p-4">Loading equipment...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-4 lg:px-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: "/equipment" })}
                    className="il-touch"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="il-display text-2xl text-foreground">
                        {equipment.name}
                    </h1>
                    <p className="il-eq-id">{equipment.serialNumber}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Badge
                        variant={
                            equipment.keyStatus === "Key Out"
                                ? "destructive"
                                : "secondary"
                        }
                    >
                        {equipment.keyStatus}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="flex flex-col gap-6">
                    <section className="border border-border bg-card p-6 flex flex-col gap-4">
                        <h2 className="il-section-label">Equipment Details</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                editForm.handleSubmit();
                            }}
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            <editForm.Field name="name">
                                {(field) => (
                                    <div className="flex flex-col gap-2 sm:col-span-2">
                                        <Label htmlFor={field.name}>Name</Label>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                        />
                                        {field.state.meta.errors.map(
                                            (err, i) => (
                                                <span key={i} className="text-sm text-destructive">
                                                    {err?.message}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            </editForm.Field>

                            <editForm.Field name="type">
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={field.name}>Type</Label>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                        />
                                        {field.state.meta.errors.map(
                                            (err, i) => (
                                                <span key={i} className="text-sm text-destructive">
                                                    {err?.message}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            </editForm.Field>

                            <editForm.Field name="serialNumber">
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={field.name}>
                                            Serial Number
                                        </Label>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                            className="font-mono"
                                        />
                                        {field.state.meta.errors.map(
                                            (err, i) => (
                                                <span key={i} className="text-sm text-destructive">
                                                    {err?.message}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            </editForm.Field>

                            <editForm.Field name="status">
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={field.name}>
                                            Status
                                        </Label>
                                        <select
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                            className="il-touch w-full rounded-none border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Deployed">Deployed</option>
                                            <option value="Under Maintenance">Under Maintenance</option>
                                            <option value="Decommissioned">Decommissioned</option>
                                        </select>
                                    </div>
                                )}
                            </editForm.Field>

                            <editForm.Field name="acquisitionDate">
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={field.name}>
                                            Acquisition Date
                                        </Label>
                                        <Input
                                            type="date"
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                        />
                                        {field.state.meta.errors.map(
                                            (err, i) => (
                                                <span key={i} className="text-sm text-destructive">
                                                    {err?.message}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            </editForm.Field>

                            <PermissionGuard action="updateEquipment">
                                <editForm.Subscribe
                                    selector={(state) => [
                                        state.canSubmit,
                                        state.isSubmitting,
                                    ]}
                                >
                                    {([canSubmit, isSubmitting]) => (
                                        <div className="sm:col-span-2 flex justify-end mt-2">
                                            <Button
                                                type="submit"
                                                disabled={!canSubmit || isSubmitting}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </editForm.Subscribe>
                            </PermissionGuard>
                        </form>
                    </section>
                </div>

                <div className="flex flex-col gap-6">
                    <section className="border border-border bg-card p-6 flex flex-col gap-4">
                        <h2 className="il-section-label">Key Management</h2>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">
                                    Current Status
                                </span>
                                <span className="font-semibold">
                                    {equipment.keyStatus}
                                </span>
                            </div>
                        </div>

                        {equipment.keyStatus === "Key Out" && (
                            <Dialog
                                open={isReturnOpen}
                                onOpenChange={setIsReturnOpen}
                            >
                                <DialogTrigger>
                                    <Button
                                        variant="outline"
                                        className="w-full mt-2 border-destructive text-destructive hover:bg-destructive/10"
                                    >
                                        Return Key
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Return Key
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4 text-sm text-muted-foreground">
                                        Confirm that the key for{" "}
                                        {equipment.name} has been returned
                                        to the operations center.
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsReturnOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleReturnKey}>
                                            Confirm Return
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useEquipment } from "@/hooks/useEquipment";
import { Button } from "@project-construction/ui/components/button";
import { Input } from "@project-construction/ui/components/input";
import { Label } from "@project-construction/ui/components/label";
import { toast } from "sonner";
import { EquipmentStatus } from "@/types";
import { z } from "zod";

export const Route = createFileRoute("/equipment/new")({
    component: NewEquipmentPage,
});

function NewEquipmentPage() {
    const navigate = useNavigate();
    const { data: equipmentList, addEquipment } = useEquipment();

    const form = useForm({
        defaultValues: {
            name: "",
            type: "",
            serialNumber: "",
            status: "Available" as EquipmentStatus,
            acquisitionDate: new Date().toISOString().split("T")[0],
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
            // Check for duplicate
            if (
                equipmentList.some(
                    (eq) => eq.serialNumber === value.serialNumber,
                )
            ) {
                toast.error("Equipment with this serial number already exists");
                return;
            }

            addEquipment({
                id: `eq-${Date.now()}`,
                name: value.name,
                type: value.type,
                serialNumber: value.serialNumber,
                status: value.status,
                keyStatus: "Key In",
                acquisitionDate: value.acquisitionDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            toast.success(`Equipment "${value.name}" registered successfully.`);
            navigate({ to: "/equipment" });
        },
    });

    return (
        <div className="mx-auto max-w-2xl flex flex-col gap-6 p-4 lg:px-8">
            <div>
                <h1 className="il-display text-2xl text-foreground">
                    Register Equipment
                </h1>
                <p className="text-sm text-muted-foreground">
                    Add a new unit to the fleet registry.
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex flex-col gap-6 border border-border bg-card p-6"
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <form.Field name="name">
                        {(field) => (
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor={field.name}>
                                    Equipment Name
                                </Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    className="il-touch text-sm"
                                    placeholder="e.g., Caterpillar 320"
                                />
                                {field.state.meta.errors.map((err, i) => (
                                    <span
                                        key={i}
                                        className="text-sm text-destructive"
                                    >
                                        {err?.message}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="type">
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
                                    className="il-touch text-sm"
                                    placeholder="e.g., Excavator"
                                />
                                {field.state.meta.errors.map((err, i) => (
                                    <span
                                        key={i}
                                        className="text-sm text-destructive"
                                    >
                                        {err?.message}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="serialNumber">
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
                                    className="il-touch text-sm font-mono"
                                    placeholder="e.g., CAT-2024-00142"
                                />
                                {field.state.meta.errors.map((err, i) => (
                                    <span
                                        key={i}
                                        className="text-sm text-destructive"
                                    >
                                        {err?.message}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="status">
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={field.name}>
                                    Initial Status
                                </Label>
                                <select
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value as EquipmentStatus,
                                        )
                                    }
                                    className="il-touch w-full rounded-none border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="Available">Available</option>
                                    <option value="Under Maintenance">
                                        Under Maintenance
                                    </option>
                                    <option value="Decommissioned">
                                        Decommissioned
                                    </option>
                                </select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="acquisitionDate">
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={field.name}>
                                    Acquisition Date
                                </Label>
                                <Input
                                    id={field.name}
                                    type="date"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    className="il-touch text-sm"
                                    max={new Date().toISOString().split("T")[0]}
                                />
                                {field.state.meta.errors.map((err, i) => (
                                    <span
                                        key={i}
                                        className="text-sm text-destructive"
                                    >
                                        {err?.message}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                    {([canSubmit, isSubmitting]) => (
                        <div className="flex justify-end gap-4 border-t border-border pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate({ to: "/equipment" })}
                                className="il-touch px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="il-touch px-8"
                            >
                                Register Equipment
                            </Button>
                        </div>
                    )}
                </form.Subscribe>
            </form>
        </div>
    );
}

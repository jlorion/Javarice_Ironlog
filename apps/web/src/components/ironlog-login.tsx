import { Button } from "@project-construction/ui/components/button";
import { Input } from "@project-construction/ui/components/input";
import { Label } from "@project-construction/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function IronLogLogin() {
    const navigate = useNavigate({
        from: "/login",
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            await authClient.signIn.email(
                {
                    email: value.email,
                    password: value.password,
                },
                {
                    onSuccess: () => {
                        navigate({
                            to: "/dashboard",
                        });
                        toast.success("Sign in successful");
                    },
                    onError: (error) => {
                        toast.error(
                            error.error.message || error.error.statusText,
                        );
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                email: z.email("Invalid email address"),
                password: z
                    .string()
                    .min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <div className="min-h-full bg-background">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="flex flex-col gap-6 border border-border bg-card p-6">
                    <div className="flex flex-col gap-2">
                        <span className="il-section-label">IronLog Access</span>
                        <h1 className="il-display text-2xl text-foreground">
                            Field Crew Login
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Secure equipment tracking for active shifts, key
                            handoffs, and site accountability.
                        </p>
                    </div>

                    <div className="grid gap-4 text-sm">
                        <div className="flex items-center justify-between border border-border bg-secondary px-4 py-4">
                            <span className="text-muted-foreground">
                                Shift Status
                            </span>
                            <span className="font-semibold text-foreground">
                                Day Crew Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between border border-border bg-secondary px-4 py-4">
                            <span className="text-muted-foreground">
                                Support Line
                            </span>
                            <span className="font-semibold text-foreground">
                                Dispatch 0917-448-2204
                            </span>
                        </div>
                        <div className="flex items-center justify-between border border-border bg-secondary px-4 py-4">
                            <span className="text-muted-foreground">
                                Operations Yard
                            </span>
                            <span className="font-semibold text-foreground">
                                Makati Yard Central
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Authorized operators only. Contact the supervisor if
                        your account is missing or locked.
                    </div>
                </section>

                <section className="border border-border bg-card p-6">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="text-sm">
                                Email
                            </Label>
                            <form.Field name="email">
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="email"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="h-12 text-sm"
                                        />
                                        {field.state.meta.errors.map(
                                            (error, index) => (
                                                <p
                                                    key={`${field.name}-error-${index}`}
                                                    className="text-sm text-destructive"
                                                >
                                                    {error?.message}
                                                </p>
                                            ),
                                        )}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password" className="text-sm">
                                Password
                            </Label>
                            <form.Field name="password">
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="password"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="h-12 text-sm"
                                        />
                                        {field.state.meta.errors.map(
                                            (error, index) => (
                                                <p
                                                    key={`${field.name}-error-${index}`}
                                                    className="text-sm text-destructive"
                                                >
                                                    {error?.message}
                                                </p>
                                            ),
                                        )}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <form.Subscribe
                            selector={(state) => ({
                                canSubmit: state.canSubmit,
                                isSubmitting: state.isSubmitting,
                            })}
                        >
                            {({ canSubmit, isSubmitting }) => (
                                <Button
                                    type="submit"
                                    className="il-touch h-12 w-full text-sm"
                                    disabled={!canSubmit || isSubmitting}
                                >
                                    {isSubmitting ? "Signing in..." : "Sign In"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </form>

                    <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground flex flex-col gap-2">
                        <span>Need access? Call dispatch or request setup from your site supervisor.</span>
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Or create an account here →
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

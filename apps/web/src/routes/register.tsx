import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background flex items-center justify-center">
      <SignUpForm onSwitchToSignIn={() => navigate({ to: "/login" })} />
    </div>
  );
}

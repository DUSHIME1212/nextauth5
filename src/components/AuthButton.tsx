import { auth, signIn, signOut } from "@/server/auth";
import { Button } from "@/components/ui/button"; 

export async function AuthButton() {
  const session = await auth();

  if (!session) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <Button type="submit">Sign In</Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span>Welcome, {session.user.name}!</span>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}
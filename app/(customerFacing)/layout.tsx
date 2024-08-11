import { Nav, NavLink } from "@/components/Nav";
import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <div className="mt-4 mr-10">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <NavLink href="/">Home</NavLink>
        <NavLink href="products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  );
}

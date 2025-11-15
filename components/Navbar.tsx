'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link } from '@heroui/react';
import { useRouter } from 'next/navigation';

export default function AppNavbar({ user }: { user?: { id: string; email: string; role: string } | null }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <Navbar>
      <NavbarBrand>
        <Link href="/" className="font-bold text-inherit">
          Credit Connect
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-2">
        {user ? (
          <>
            {user.role === 'client' && (
              <>
                <NavbarItem className="hidden sm:flex">
                  <Link href="/client/dashboard" color="foreground">
                    Dashboard
                  </Link>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Link href="/client/risk-profile" color="foreground">
                    Risk Profile
                  </Link>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Link href="/client/marketplace" color="foreground">
                    Marketplace
                  </Link>
                </NavbarItem>
              </>
            )}
            {user.role === 'bank' && (
              <>
                <NavbarItem className="hidden sm:flex">
                  <Link href="/bank/dashboard" color="foreground">
                    Dashboard
                  </Link>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Link href="/bank/portfolio" color="foreground">
                    Portfolio
                  </Link>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Link href="/bank/products" color="foreground">
                    Products
                  </Link>
                </NavbarItem>
              </>
            )}
            <NavbarItem>
              <Button color="danger" variant="flat" onPress={handleLogout}>
                Logout
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link href="/login" color="foreground">
                Login
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/register" color="foreground">
                Register
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}


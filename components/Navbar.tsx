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
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {user ? (
          <>
            {user.role === 'client' && (
              <>
                <NavbarItem>
                  <Link href="/client/dashboard" color="foreground">
                    Dashboard
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link href="/client/risk-profile" color="foreground">
                    Risk Profile
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link href="/client/marketplace" color="foreground">
                    Marketplace
                  </Link>
                </NavbarItem>
              </>
            )}
            {user.role === 'bank' && (
              <>
                <NavbarItem>
                  <Link href="/bank/dashboard" color="foreground">
                    Dashboard
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link href="/bank/portfolio" color="foreground">
                    Portfolio
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link href="/bank/products" color="foreground">
                    Products
                  </Link>
                </NavbarItem>
              </>
            )}
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
      <NavbarContent justify="end">
        {user && (
          <NavbarItem>
            <Button color="danger" variant="flat" onPress={handleLogout}>
              Logout
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}


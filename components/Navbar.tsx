'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MinecraftLogo from './MinecraftLogo';

export default function AppNavbar({ user }: { user?: { id: string; email: string; role: string } | null }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <Navbar maxWidth="full" className="px-4 sm:px-8 lg:px-12">
      <NavbarBrand className="flex-grow-0 mr-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <MinecraftLogo className="transition-transform group-hover:scale-110" />
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-2 flex-grow-0 ml-auto">
        {user ? (
          <>
            {user.role === 'client' && (
              <>
                <NavbarItem className="hidden sm:flex">
                  <Button as={Link} href="/client/dashboard" variant="flat" color="default">
                    Dashboard
                  </Button>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Button as={Link} href="/client/risk-profile" variant="flat" color="default">
                    Risk Profile
                  </Button>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Button as={Link} href="/client/marketplace" variant="flat" color="default">
                    Marketplace
                  </Button>
                </NavbarItem>
              </>
            )}
            {user.role === 'bank' && (
              <>
                <NavbarItem className="hidden sm:flex">
                  <Button as={Link} href="/bank/dashboard" variant="flat" color="default">
                    Dashboard
                  </Button>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Button as={Link} href="/bank/portfolio" variant="flat" color="default">
                    Portfolio
                  </Button>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                  <Button as={Link} href="/bank/products" variant="flat" color="default">
                    Products
                  </Button>
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
              <Button as={Link} href="/login" variant="flat" color="default">
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} href="/register" variant="flat" color="default">
                Register
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}


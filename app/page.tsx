'use client';

import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import Link from 'next/link';
import AppNavbar from '@/components/Navbar';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Credit Connect
          </h1>
          <p className="text-2xl text-foreground-500 mb-8">
            AI-Powered Lending Platform with Proprietary Risk Assessment
          </p>
          <div className="flex gap-4 justify-center">
            {!mounted || !user ? (
              <>
                <Link href="/register">
                  <Button color="primary" size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button color="default" variant="bordered" size="lg">
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={user.role === 'client' ? '/client/dashboard' : '/bank/dashboard'}>
                <Button color="primary" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Beyond Credit Scores</h3>
            </CardHeader>
            <CardBody>
              <p>
                Proprietary AI-driven risk assessment using 100+ alternative data signals
                to evaluate creditworthiness beyond traditional metrics.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Instant Pre-Approvals</h3>
            </CardHeader>
            <CardBody>
              <p>
                Real-time risk calculation enables guaranteed offers without hard credit
                pulls, providing transparency and speed.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Financial Inclusion</h3>
            </CardHeader>
            <CardBody>
              <p>
                Serves credit invisible populations with alternative scoring methods,
                expanding access to financial services.
              </p>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import AppNavbar from '@/components/Navbar';

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productType: 'personal_loan',
    baseInterestRate: '',
    minLoanAmount: '',
    maxLoanAmount: '',
    minTermMonths: '',
    maxTermMonths: '',
    baseOriginationFee: '',
    minHelixScore: '',
    maxHelixScore: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.role === 'bank') {
          setUser(data.user);
          loadProducts(token);
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadProducts = (token: string) => {
    // In a real app, this would fetch from /api/products
    // For now, we'll show a placeholder
    setProducts([]);
  };

  const handleCreateProduct = async () => {
    // Implementation for creating a product
    onClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Product Manager</h1>
          <Button color="primary" onPress={onOpen}>
            Create Product
          </Button>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center py-8 text-gray-500">
                No products yet. Create your first product to get started.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                  <Chip color={product.isActive ? 'success' : 'default'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Chip>
                </CardHeader>
                <CardBody>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Interest Rate</p>
                      <p className="text-lg font-semibold">{product.baseInterestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Loan Amount</p>
                      <p className="text-lg font-semibold">
                        ${product.minLoanAmount.toLocaleString()} - ${product.maxLoanAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Term</p>
                      <p className="text-lg font-semibold">
                        {product.minTermMonths} - {product.maxTermMonths} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Helix Score Range</p>
                      <p className="text-lg font-semibold">
                        {product.minHelixScore || 0} - {product.maxHelixScore || 100}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>Create New Product</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Select
                  label="Product Type"
                  selectedKeys={[formData.productType]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, productType: selected });
                  }}
                >
                  <SelectItem key="personal_loan" value="personal_loan">Personal Loan</SelectItem>
                  <SelectItem key="auto_loan" value="auto_loan">Auto Loan</SelectItem>
                  <SelectItem key="mortgage" value="mortgage">Mortgage</SelectItem>
                  <SelectItem key="credit_line" value="credit_line">Credit Line</SelectItem>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Base Interest Rate (%)"
                    type="number"
                    value={formData.baseInterestRate}
                    onChange={(e) => setFormData({ ...formData, baseInterestRate: e.target.value })}
                    required
                  />
                  <Input
                    label="Origination Fee ($)"
                    type="number"
                    value={formData.baseOriginationFee}
                    onChange={(e) => setFormData({ ...formData, baseOriginationFee: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Loan Amount ($)"
                    type="number"
                    value={formData.minLoanAmount}
                    onChange={(e) => setFormData({ ...formData, minLoanAmount: e.target.value })}
                    required
                  />
                  <Input
                    label="Max Loan Amount ($)"
                    type="number"
                    value={formData.maxLoanAmount}
                    onChange={(e) => setFormData({ ...formData, maxLoanAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Term (months)"
                    type="number"
                    value={formData.minTermMonths}
                    onChange={(e) => setFormData({ ...formData, minTermMonths: e.target.value })}
                    required
                  />
                  <Input
                    label="Max Term (months)"
                    type="number"
                    value={formData.maxTermMonths}
                    onChange={(e) => setFormData({ ...formData, maxTermMonths: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Helix Score"
                    type="number"
                    value={formData.minHelixScore}
                    onChange={(e) => setFormData({ ...formData, minHelixScore: e.target.value })}
                  />
                  <Input
                    label="Max Helix Score"
                    type="number"
                    value={formData.maxHelixScore}
                    onChange={(e) => setFormData({ ...formData, maxHelixScore: e.target.value })}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleCreateProduct}>
                Create
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </div>
  );
}



import React, { useState, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplierService';
import { Supplier } from '../types';
import Button from './Button'; 

// A simple modal component, assuming one might exist in the project
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface SupplierFormInputs {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  school_id: string; // This should be sourced from context or props
}

const SupplierManagementView: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupplierFormInputs>();

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await getSuppliers(schoolId);
      setSuppliers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchSuppliers();
    }
  }, [schoolId]);

  const openModal = (supplier: Supplier | null = null) => {
    reset();
    setEditingSupplier(supplier);
    if (supplier) {
      setValue('name', supplier.name);
      setValue('contact_person', supplier.contact_person);
      setValue('email', supplier.email);
      setValue('phone', supplier.phone);
      setValue('address', supplier.address);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    reset();
  };

  const onSubmit: SubmitHandler<SupplierFormInputs> = async (formData) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, { ...formData, school_id: schoolId });
      } else {
        await createSupplier({ ...formData, school_id: schoolId });
      }
      fetchSuppliers();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        fetchSuppliers();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };
  
  const memoizedSuppliers = useMemo(() => suppliers, [suppliers]);

  if (isLoading) {
    return <div className="text-center p-4">Loading suppliers...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
        <Button onClick={() => openModal()} className="bg-blue-500 hover:bg-blue-600 text-white">
          Add Supplier
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Person</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {memoizedSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{supplier.name}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{supplier.contact_person || '-'}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{supplier.email || '-'}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{supplier.phone || '-'}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-right">
                  <Button onClick={() => openModal(supplier)} className="bg-gray-200 text-gray-700 text-xs mr-2">Edit</Button>
                  <Button onClick={() => handleDelete(supplier.id)} className="bg-red-500 text-white text-xs">Delete</Button>
                </td>
              </tr>
            ))}
             {memoizedSuppliers.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">
                        No suppliers found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-xl font-semibold">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Supplier Name</label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">Contact Person</label>
            <input id="contact_person" type="text" {...register('contact_person')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input id="email" type="email" {...register('email')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="phone" type="tel" {...register('phone')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea id="address" {...register('address')} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div className="flex justify-end gap-3">
             <Button type="button" onClick={closeModal} className="bg-gray-300 hover:bg-gray-400">Cancel</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierManagementView;

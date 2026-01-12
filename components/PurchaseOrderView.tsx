
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { Plus, Trash2, Edit, Eye, X } from 'lucide-react';

import { 
    PurchaseOrder, 
    PurchaseOrderItem, 
    PurchaseOrderStatus,
    Supplier,
    Product,
    OperatingUnit
} from '../types';
import { 
    getPurchaseOrders, 
    getPurchaseOrderById, 
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
} from '../services/purchaseOrderService';
import Button from './Button';

// Mock data/services that would be needed
const getProductsByUnit = async (unitId: string): Promise<Product[]> => {
    // In a real app, this would fetch from a service
    console.log(`Fetching products for unit ${unitId}`);
    return [
        { id: 'prod_1', name: 'Burger Patty', price: 25, category: 'Hot Meals' } as Product,
        { id: 'prod_2', name: 'Soda Can', price: 10, category: 'Drinks' } as Product,
        { id: 'prod_3', name: 'Notebook', price: 15, category: 'School Supplies' } as Product,
    ];
}

type PurchaseOrderFormInputs = {
  unit_id: string;
  supplier_id: string;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity_ordered: number;
    unit_cost: number;
  }[];
};

const PurchaseOrderView: React.FC<{ 
    schoolId: string;
    suppliers: Supplier[];
    operatingUnits: OperatingUnit[];
    userId: string; // Logged in user
}> = ({ schoolId, suppliers, operatingUnits, userId }) => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<PurchaseOrderFormInputs>({
        defaultValues: {
            items: [{ product_id: '', quantity_ordered: 1, unit_cost: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });
    
    const watchedUnitId = watch('unit_id');
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (watchedUnitId) {
            getProductsByUnit(watchedUnitId).then(setAvailableProducts);
        } else {
            setAvailableProducts([]);
        }
    }, [watchedUnitId]);

    const fetchPurchaseOrders = async () => {
        try {
            setIsLoading(true);
            const data = await getPurchaseOrders(schoolId);
            setPurchaseOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseOrders();
    }, [schoolId]);

    const openModal = () => {
        reset({
            unit_id: '',
            supplier_id: '',
            notes: '',
            items: [{ product_id: '', quantity_ordered: 1, unit_cost: 0 }]
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPo(null);
    };
    
    const viewDetails = async (id: string) => {
        const fullPo = await getPurchaseOrderById(id);
        setSelectedPo(fullPo);
        setIsModalOpen(true);
    };

    const onSubmit: SubmitHandler<PurchaseOrderFormInputs> = async (formData) => {
        try {
            const payload = {
                ...formData,
                school_id: schoolId,
                status: PurchaseOrderStatus.DRAFT,
                created_by: userId,
                order_date: new Date().toISOString(),
                items: formData.items.map(item => ({
                    ...item,
                    quantity_received: 0,
                })),
            };
            await createPurchaseOrder(payload);
            fetchPurchaseOrders();
            closeModal();
        } catch (err: any) {
            setError(`Failed to create purchase order: ${err.message}`);
        }
    };
    
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Purchase Orders</h1>
                <Button onClick={openModal} className="bg-blue-500 text-white"><Plus className="mr-2 h-4 w-4" />Create PO</Button>
            </div>

            {/* PO List */}
            <div className="bg-white shadow rounded-lg">
                <table className="min-w-full">
                    <thead>
                        {/* headers */}
                    </thead>
                    <tbody>
                        {purchaseOrders.map(po => (
                            <tr key={po.id}>
                                <td className="p-3">{po.id.substring(0, 8)}...</td>
                                <td className="p-3">{po.supplier?.name}</td>
                                <td className="p-3">{po.unit?.name}</td>
                                <td className="p-3">{new Date(po.order_date).toLocaleDateString()}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${po.status === 'DRAFT' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{po.status}</span></td>
                                <td className="p-3">
                                    <Button onClick={() => viewDetails(po.id)} className="text-xs bg-gray-200"><Eye size={12}/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Create/View */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedPo ? `PO Details: ${selectedPo.id.substring(0,8)}` : 'Create New Purchase Order'}</h2>
                            <Button onClick={closeModal} className="bg-transparent text-gray-700"><X /></Button>
                        </div>
                        
                        {selectedPo ? (
                            // View Details
                            <div>
                                {/* Details rendering logic here */}
                                <p><strong>Supplier:</strong> {selectedPo.supplier?.name}</p>
                                <p><strong>Status:</strong> {selectedPo.status}</p>
                                <h3 className="font-bold mt-4">Items:</h3>
                                <ul>
                                    {selectedPo.items?.map(item => (
                                        <li key={item.id}>{item.product?.name} - Qty: {item.quantity_ordered}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            // Create Form
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {/* Unit & Supplier selection */}
                                </div>

                                <h3 className="mt-6 mb-2 font-bold">Items</h3>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center mb-2">
                                        <Controller
                                            name={`items.${index}.product_id`}
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <select {...field} className="p-2 border rounded w-1/2">
                                                    <option value="">Select Product</option>
                                                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            )}
                                        />
                                        <input type="number" {...register(`items.${index}.quantity_ordered`, { valueAsNumber: true, min: 1 })} className="p-2 border rounded w-1/4" />
                                        <input type="number" step="0.01" {...register(`items.${index}.unit_cost`, { valueAsNumber: true, min: 0 })} className="p-2 border rounded w-1/4" />
                                        <Button type="button" onClick={() => remove(index)} className="bg-red-500 text-white p-2 rounded"><Trash2 size={16}/></Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={() => append({ product_id: '', quantity_ordered: 1, unit_cost: 0 })} className="text-sm mt-2">Add Item</Button>

                                <div className="mt-6 flex justify-end gap-3">
                                    <Button type="button" onClick={closeModal} className="bg-gray-300">Cancel</Button>
                                    <Button type="submit" className="bg-blue-600 text-white">Create Purchase Order</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderView;

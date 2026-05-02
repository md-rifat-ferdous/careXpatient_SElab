"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface OrderItem {
  id: string;
  price: number;
  labTest: {
    name: string;
    tag: string;
    lab: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Test Reports & Bookings</h1>
        <p className="text-subtle-gray mt-1">Track your upcoming tests and download results</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">No bookings found</h2>
          <p className="text-subtle-gray max-w-sm text-center">
            You haven't booked any lab tests yet. Once you do, your reports and tracking info will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-subtle-gray uppercase tracking-widest">
                        Booking ID: {order.id.split('-')[0].toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">৳{order.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-subtle-gray font-bold">Total Amount</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 md:p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                            <span className="material-symbols-outlined text-[20px]">science</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface leading-tight">{item.labTest.name}</p>
                            <p className="text-xs text-subtle-gray mt-0.5">{item.labTest.lab.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-on-surface">৳{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-subtle-gray">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Sample collection details will be shared via SMS</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                      View Details
                    </button>
                    {order.status.toLowerCase() === 'completed' && (
                      <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

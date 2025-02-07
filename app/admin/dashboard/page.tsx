"use client";
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await client.fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      );
      setOrders(data);
    } catch (error) {
      Swal.fire("Error", `Failed to fetch orders: ${error}`, "error");
    }
  };

  const filteredOrders = orders.filter(order => 
    (filter === "All" || order.status === filter) &&
    (searchTerm === "" || 
      order.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Delete Order",
      text: "Are you sure you want to delete this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted", "Order has been deleted", "success");
    } catch (error) {
      Swal.fire("Error", `Failed to delete order: ${error}`,);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Order status changed to ${newStatus}`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire("Error", `Failed to update order status: ${error}`,);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispatch': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
            
            {/* Search and Filter */}
            <div className="flex space-x-4 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispatch">Dispatch</option>
                <option value="success">Completed</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-4 text-left">Order ID</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Total</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleOrderDetails(order._id)}
                      >
                        <td className="p-4">{order._id.slice(-6)}</td>
                        <td className="p-4">{order.firstName} {order.lastName}</td>
                        <td className="p-4">${order.total.toFixed(2)}</td>
                        <td className="p-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 space-x-2">
                          <select 
                            className="px-2 py-1 border rounded"
                            value={order.status || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="dispatch">Dispatch</option>
                            <option value="success">Completed</option>
                          </select>
                          <button 
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order._id);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {selectedOrderId === order._id && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50 p-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-bold mb-2">Customer Details</h3>
                                <p><strong>Phone:</strong> {order.phone}</p>
                                <p><strong>Email:</strong> {order.email}</p>
                                <p><strong>Address:</strong> {order.address}, {order.city} {order.zipCode}</p>
                              </div>
                              <div>
                                <h3 className="font-bold mb-2">Order Items</h3>
                                {order.cartItems.map((item, index) => (
                                  <div key={index} className="flex items-center mb-2">
                                    {item.image && (
                                      <Image 
                                        src={urlFor(item.image).url()} 
                                        width={50} 
                                        height={50} 
                                        alt={item.productName} 
                                        className="mr-4 rounded"
                                      />
                                    )}
                                    <span>{item.productName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg mt-4">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
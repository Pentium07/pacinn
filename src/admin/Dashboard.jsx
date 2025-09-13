import React from 'react';
import { FaMoneyBillWave, FaTicketAlt, FaCalendarCheck } from 'react-icons/fa';

const Dashboard = () => {
  // Mock data for cards
  const stats = [
    { title: 'Total Income', value: '₦125,000,000', icon: <FaMoneyBillWave className="text-3xl text-white" />, bgColor: 'bg-tetClr' },
    { title: 'Total Tickets Sold', value: '4,320', icon: <FaTicketAlt className="text-3xl text-white" />, bgColor: 'bg-tetClr' },
    { title: 'Total Bookings', value: '1,245', icon: <FaCalendarCheck className="text-3xl text-white" />, bgColor: 'bg-tetClr' },
  ];

  // Mock data for recent bookings (inspired by Bookings component)
  const recentBookings = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+234 98765 43210',
      checkInDate: '2025-09-10',
      checkOutDate: '2025-09-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+234 87654 32109',
      checkInDate: '2025-09-12',
      checkOutDate: '2025-09-18',
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+234 76543 21098',
      checkInDate: '2025-09-11',
      checkOutDate: '2025-09-14',
    },
  ];

  // Calculate duration of stay
  const calculateDuration = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Invalid dates';
  };

  return (
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-tetClr">
            Dashboard Overview
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative bg-tetClr/50 rounded-xl shadow-lg p-6 flex flex-col gap-4 transform hover:scale-[1.03] hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* <div className={`absolute inset-0 ${stat.bgColor} opacity-10`}></div> */}
              <div className={`w-14 h-14 ${stat.bgColor} rounded-lg flex items-center justify-center shadow-md`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-trdClr font-medium">+{Math.floor(Math.random() * 10 + 5)}% from last month</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-tetClr/50 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            {/* <div className="text-indigo-600 font-medium text-sm hover:underline cursor-pointer">View All</div> */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-tetClr/20 text-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold md:px-6">Name</th>
                  <th className="px-4 py-3 font-semibold md:px-6">Email</th>
                  <th className="px-4 py-3 font-semibold md:px-6">Phone</th>
                  <th className="px-4 py-3 font-semibold md:px-6">Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 md:px-6 font-medium text-gray-900">{booking.name}</td>
                    <td className="px-4 py-4 md:px-6">{booking.email}</td>
                    <td className="px-4 py-4 md:px-6">{booking.phone}</td>
                    <td className="px-4 py-4 md:px-6">
                      {calculateDuration(booking.checkInDate, booking.checkOutDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
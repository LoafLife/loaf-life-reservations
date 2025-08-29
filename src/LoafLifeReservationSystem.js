import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, CreditCard, Shield, CheckCircle } from 'lucide-react';

const LoafLifeReservationSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [reservationsByDate, setReservationsByDate] = useState({});
  const [bookingComplete, setBookingComplete] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  // Pass options
  const passOptions = [
    {
      id: 'first-tracks',
      name: 'First Tracks',
      price: 15,
      description: 'Day Pass - Full day access to coworking space',
      duration: '1 day',
      type: 'day'
    },
    {
      id: 'the-gate',
      name: 'The Gate',
      price: 50,
      description: 'Day Rate for Private Office',
      duration: '1 day',
      type: 'private-day'
    },
    {
      id: 'base-lodge',
      name: 'Base Lodge',
      price: 60,
      description: '1 Week Membership - Unlimited access for 7 consecutive days',
      duration: '7 days',
      type: 'week'
    },
    {
      id: 'mountain-local',
      name: 'Mountain Local',
      price: 175,
      description: '1 Month Membership - Unlimited access for 30 days',
      duration: '30 days',
      type: 'monthly'
    },
    {
      id: 'gondola-month',
      name: 'The Gondola',
      price: 350,
      description: 'Private Reserved Workstation - Monthly membership',
      duration: '30 days',
      type: 'reserved-monthly'
    },
    {
      id: 'gondola-commitment',
      name: 'The Gondola',
      price: 250,
      description: 'Private Reserved Workstation - 6 to 12 month commitment',
      duration: '6-12 months',
      type: 'reserved-commitment'
    },
    {
      id: 'private-office',
      name: 'Private',
      price: 450,
      description: 'Private Office - Full month access to dedicated private office',
      duration: '30 days',
      type: 'private-monthly'
    }
  ];

  // Inventory structure based on actual space layout
  const spaceInventory = {
    'first-tracks': { 
      name: 'Flex Space Access', 
      dailyCapacity: 12, 
      description: 'Access to flex desks and shared workspace areas',
      spaces: ['Tufts Run', 'Carrabassett Way', 'Bigelow Glades', 'Flagstaff Bowl', 'Cathedral Drop', 'Poplar Cruiser', 'Little Big', 'Cranberry Chute', 'Horn\'s Edge', 'West Face', 'Abe\'s Summit', 'Spaulding Steeps']
    },
    'the-gate': { 
      name: 'The Gate Private Office', 
      dailyCapacity: 1, 
      description: 'Day access to The Gate private office with lockable door',
      spaces: ['The Gate']
    },
    'gondola-month': { 
      name: 'Gondola Workstations', 
      dailyCapacity: 4, 
      description: 'Access to reserved Gondola workstations with storage',
      spaces: ['Gondola 1', 'Gondola 2', 'Gondola 3', 'Gondola 4']
    },
    'gondola-commitment': { 
      name: 'Gondola Workstations', 
      dailyCapacity: 4, 
      description: 'Reserved Gondola workstations (6-12 month commitment)',
      spaces: ['Gondola 1', 'Gondola 2', 'Gondola 3', 'Gondola 4']
    },
    'base-lodge': { 
      name: 'Flex Space Access', 
      dailyCapacity: 12, 
      description: 'Weekly access to flex desks and shared spaces',
      spaces: ['Tufts Run', 'Carrabassett Way', 'Bigelow Glades', 'Flagstaff Bowl', 'Cathedral Drop', 'Poplar Cruiser', 'Little Big', 'Cranberry Chute', 'Horn\'s Edge', 'West Face', 'Abe\'s Summit', 'Spaulding Steeps']
    },
    'mountain-local': { 
      name: 'Flex Space Access', 
      dailyCapacity: 12, 
      description: 'Monthly access to flex desks and shared spaces',
      spaces: ['Tufts Run', 'Carrabassett Way', 'Bigelow Glades', 'Flagstaff Bowl', 'Cathedral Drop', 'Poplar Cruiser', 'Little Big', 'Cranberry Chute', 'Horn\'s Edge', 'West Face', 'Abe\'s Summit', 'Spaulding Steeps']
    },
    'private-office': { 
      name: 'Ira Mountain Private Office', 
      dailyCapacity: 1, 
      description: 'Full month access to Ira Mountain dedicated private office',
      spaces: ['Ira Mountain']
    }
  };

  // Track reservations by date and pass type
  const [reservationsByDateState, setReservationsByDateState] = useState({});

  // Check availability for a pass type on selected dates
  const checkAvailability = (passType, dates) => {
    const capacity = spaceInventory[passType]?.dailyCapacity || 0;
    
    return dates.every(dateString => {
      const dateReservations = reservationsByDate[dateString] || {};
      const currentReservations = dateReservations[passType] || 0;
      return currentReservations < capacity;
    });
  };

  // Get remaining capacity for a pass type on a specific date
  const getRemainingCapacity = (passType, dateString) => {
    const capacity = spaceInventory[passType]?.dailyCapacity || 0;
    const dateReservations = reservationsByDate[dateString] || {};
    const currentReservations = dateReservations[passType] || 0;
    return Math.max(0, capacity - currentReservations);
  };

  // Check if a pass is available for any of the next 30 days
  const isPassAvailableInPeriod = (passType) => {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const remainingCapacity = getRemainingCapacity(passType, dateString);
      if (remainingCapacity > 0) {
        return true;
      }
    }
    return false;
  };

  // Get available passes (filter out completely sold out passes)
  const getAvailablePasses = () => {
    return passOptions.filter(pass => isPassAvailableInPeriod(pass.id));
  };

  const availablePasses = getAvailablePasses();

  // Generate calendar dates for next 30 days
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Check if space is available on selected dates
  const isSpaceAvailable = (passType, dates) => {
    return checkAvailability(passType, dates);
  };

  // Handle date selection
  const toggleDateSelection = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDates(prev => {
      if (prev.includes(dateString)) {
        return prev.filter(d => d !== dateString);
      } else {
        return [...prev, dateString].sort();
      }
    });
  };

  // Simulate Stripe payment
  const processPayment = async () => {
    // In real implementation, this would integrate with Stripe API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, paymentId: 'pi_' + Math.random().toString(36).substr(2, 9) });
      }, 2000);
    });
  };

  // Simulate SMS service
  const sendAccessCode = async (phone) => {
    // In real implementation, this would integrate with SMS service (Twilio, etc.)
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    setAccessCode(code);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, code });
      }, 1000);
    });
  };

  // Complete booking process
  const completeBooking = async () => {
    try {
      // Process payment
      const payment = await processPayment();
      if (!payment.success) throw new Error('Payment failed');

      // Reserve space dates
      const newReservations = { ...reservationsByDate };
      selectedDates.forEach(date => {
        if (!newReservations[date]) newReservations[date] = {};
        const currentCount = newReservations[date][selectedPass.id] || 0;
        newReservations[date][selectedPass.id] = currentCount + 1;
      });
      setReservationsByDate(newReservations);

      // Send access code
      await sendAccessCode(customerInfo.phone);

      setBookingComplete(true);
    } catch (error) {
      alert('Booking failed: ' + error.message);
    }
  };

  const calculateTotal = () => {
    if (!selectedPass || selectedDates.length === 0) return 0;
    
    // Day passes multiply by number of days selected
    if (selectedPass.type === 'day' || selectedPass.type === 'private-day') {
      return selectedPass.price * selectedDates.length;
    }
    // All other passes are flat rate regardless of dates selected
    return selectedPass.price;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (bookingComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your desk reservation has been successfully processed.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Booking Details:</h3>
            <p><strong>Pass:</strong> {selectedPass.name}</p>
            <p><strong>Space:</strong> {spaceInventory[selectedPass.id]?.name}</p>
            <p><strong>Dates:</strong> {selectedDates.map(formatDate).join(', ')}</p>
            <p><strong>Total Paid:</strong> ${calculateTotal()}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Your Access Code</h3>
            <p className="text-2xl font-bold text-blue-600 mb-2">{accessCode}</p>
            <p className="text-sm text-gray-600">A text message has been sent to {customerInfo.phone}</p>
          </div>

          <button
            onClick={() => {
              setCurrentStep(1);
              setSelectedDates([]);
              setSelectedPass(null);
              setBookingComplete(false);
              setCustomerInfo({ name: '', email: '', phone: '' });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reserve Your Desk at Loaf Life</h1>
        <p className="text-gray-600">Lifting Our Area's Future - Professional coworking in the heart of Kingfield</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 5 && <div className={`w-12 h-1 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Pass Type */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Choose Your Pass</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePasses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg mb-2">All passes are currently sold out</p>
                <p className="text-sm text-gray-400">Please check back later or contact us for availability</p>
              </div>
            ) : (
              availablePasses.map((pass) => (
                <div
                  key={pass.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPass?.id === pass.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPass(pass)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{pass.name}</h3>
                    <div className="flex flex-col items-end gap-1">
                      {(pass.type === 'reserved-commitment' || pass.type === 'reserved-monthly') && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Reserved</span>
                      )}
                      {pass.type === 'private-monthly' && (
                        <span className="bg-gold-100 text-gold-800 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Private</span>
                      )}
                      {!isPassAvailableInPeriod(pass.id) && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Limited</span>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-2">${pass.price}</p>
                  <p className="text-sm text-gray-600 mb-2">{pass.description}</p>
                  <p className="text-xs text-gray-500">{pass.duration}</p>
                  {pass.type === 'reserved-commitment' && (
                    <p className="text-xs text-green-600 font-medium mt-1">Best Value!</p>
                  )}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setCurrentStep(2)}
            disabled={!selectedPass}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {availablePasses.length === 0 ? 'No Passes Available' : 'Continue to Date Selection'}
          </button>
        </div>
      )}

      {/* Step 2: Select Dates */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Select Your Dates</h2>
            <p className="text-sm text-gray-600">
              {selectedPass?.name} - ${selectedPass?.price}
              {(selectedPass?.type === 'day' || selectedPass?.type === 'private-day') && selectedDates.length > 0 && ` x ${selectedDates.length} days`}
            </p>
          </div>

          {/* Space Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">{spaceInventory[selectedPass.id]?.name}</h3>
            <p className="text-sm text-blue-700">{spaceInventory[selectedPass.id]?.description}</p>
            <p className="text-xs text-blue-600 mt-1">
              Daily capacity: {spaceInventory[selectedPass.id]?.dailyCapacity} 
              {spaceInventory[selectedPass.id]?.dailyCapacity === 1 ? ' space' : ' spaces'}
            </p>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-700 py-2">{day}</div>
            ))}
            {calendarDates.map((date) => {
              const dateString = date.toISOString().split('T')[0];
              const isSelected = selectedDates.includes(dateString);
              const isToday = date.toDateString() === new Date().toDateString();
              const remainingCapacity = getRemainingCapacity(selectedPass.id, dateString);
              const isAvailable = remainingCapacity > 0;
              
              return (
                <button
                  key={dateString}
                  onClick={() => isAvailable && toggleDateSelection(date)}
                  disabled={!isAvailable}
                  className={`p-2 text-sm rounded-lg border transition-colors relative ${
                    !isAvailable
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isToday
                      ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>{date.getDate()}</div>
                  {isAvailable && remainingCapacity < spaceInventory[selectedPass.id]?.dailyCapacity && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 text-white text-xs rounded-full flex items-center justify-center">
                      {remainingCapacity}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDates.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">Selected dates:</p>
              <p className="text-sm text-gray-600">{selectedDates.map(formatDate).join(', ')}</p>
              <p className="font-semibold mt-2">Total: ${calculateTotal()}</p>
              {!isSpaceAvailable(selectedPass.id, selectedDates) && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Some selected dates have limited availability. Please review your selection.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={selectedDates.length === 0 || !isSpaceAvailable(selectedPass.id, selectedDates)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Review & Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review Selection */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Review Your Selection</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Pass Type:</span>
                <span>{selectedPass.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Space:</span>
                <span>{spaceInventory[selectedPass.id]?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Available Spaces:</span>
                <div className="text-right text-sm">
                  {spaceInventory[selectedPass.id]?.spaces.slice(0, 3).join(', ')}
                  {spaceInventory[selectedPass.id]?.spaces.length > 3 && ` + ${spaceInventory[selectedPass.id]?.spaces.length - 3} more`}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Dates:</span>
                <div className="text-right">
                  {selectedDates.map((date, index) => (
                    <div key={date}>{formatDate(date)}</div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">${calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What's Included:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {selectedPass.id === 'first-tracks' && (
                <>
                  <li>• Access to all 12 flex desks including Tufts Run, Carrabassett Way, Bigelow Glades</li>
                  <li>• High-speed WiFi and power outlets at every space</li>
                  <li>• Coffee and tea service</li>
                  <li>• Conference room booking (subject to availability)</li>
                </>
              )}
              {selectedPass.id === 'the-gate' && (
                <>
                  <li>• Private access to The Gate office for the day</li>
                  <li>• Lockable door for privacy and security</li>
                  <li>• Dedicated phone line and premium WiFi</li>
                  <li>• Coffee and tea service</li>
                </>
              )}
              {(selectedPass.id === 'base-lodge' || selectedPass.id === 'mountain-local') && (
                <>
                  <li>• Unlimited access to all 12 flex desk spaces</li>
                  <li>• Priority booking for premium spots like Cathedral Drop and Spaulding Steeps</li>
                  <li>• Conference room access included</li>
                  <li>• Member events and networking opportunities</li>
                </>
              )}
              {(selectedPass.id === 'gondola-month' || selectedPass.id === 'gondola-commitment') && (
                <>
                  <li>• Dedicated access to reserved Gondola workstations (1-4)</li>
                  <li>• Personal storage locker and workspace customization</li>
                  <li>• Priority booking for conference room and flex spaces</li>
                  <li>• Member events and networking opportunities</li>
                </>
              )}
              {selectedPass.id === 'private-office' && (
                <>
                  <li>• Exclusive access to Ira Mountain private office</li>
                  <li>• Lockable door with 24/7 access and security</li>
                  <li>• Dedicated phone line and mailing address</li>
                  <li>• Priority access to all shared spaces and meeting rooms</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Dates
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enter Your Information
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Customer Information */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number for access code"
              />
              <p className="text-xs text-gray-500 mt-1">You'll receive your door access code via SMS</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Booking Summary:</h3>
            <p><strong>Pass:</strong> {selectedPass.name}</p>
            <p><strong>Space:</strong> {spaceInventory[selectedPass.id]?.name}</p>
            <p><strong>Dates:</strong> {selectedDates.map(formatDate).join(', ')}</p>
            <p className="text-lg font-bold mt-2">Total: ${calculateTotal()}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Reservation</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Final Booking Summary:</h3>
            <p><strong>Name:</strong> {customerInfo.name}</p>
            <p><strong>Email:</strong> {customerInfo.email}</p>
            <p><strong>Phone:</strong> {customerInfo.phone}</p>
            <p><strong>Pass:</strong> {selectedPass.name}</p>
            <p><strong>Space:</strong> {spaceInventory[selectedPass.id]?.name}</p>
            <p><strong>Dates:</strong> {selectedDates.map(formatDate).join(', ')}</p>
            <p className="text-xl font-bold mt-2 text-blue-600">Total: ${calculateTotal()}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold">Secure Payment</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              You'll be redirected to Stripe to complete your payment securely. After payment, 
              you'll receive an access code via SMS to enter Loaf Life.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(4)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={completeBooking}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Complete Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoafLifeReservationSystem;

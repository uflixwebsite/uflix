'use client';

import { useState } from 'react';

interface PincodeData {
  state: string;
  city: string;
  transitDays: string;
  assemblyDays: string;
}

interface PincodeCheckerProps {
  onPincodeChange?: (pincode: string, data: PincodeData | null) => void;
}

export default function PincodeChecker({ onPincodeChange }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkPincode = async (code: string) => {
    if (code.length < 2) return;
    
    setLoading(true);
    setError('');
    setIsValid(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const base = apiBase ? apiBase.replace(/\/$/, '') : '';
      const response = await fetch(`${base}/pincode/${code}`);
      const result = await response.json();

      if (result.success) {
        setPincodeData(result.data);
        setIsValid(true);
        setError('');
        onPincodeChange?.(code, result.data);
      } else {
        setPincodeData(null);
        setIsValid(false);
        setError(result.message || 'Delivery not available in this area');
        onPincodeChange?.(code, null);
      }
    } catch (err) {
      setPincodeData(null);
      setIsValid(false);
      setError('Failed to check delivery availability');
      onPincodeChange?.(code, null);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    // Limit to 6 digits
    if (value.length > 6) {
      return;
    }
    
    setPincode(value);
    setError('');
    setIsValid(null);
    setPincodeData(null);
    onPincodeChange?.(value, null);
  };

  const handleCheckClick = () => {
    if (pincode.length >= 2) {
      checkPincode(pincode);
    } else {
      setError('Please enter at least 2 digits to check');
    }
  };

  const handleClear = () => {
    setPincode('');
    setPincodeData(null);
    setError('');
    setIsValid(null);
    onPincodeChange?.('', null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-semibold">Check Delivery</h3>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChange={handlePincodeChange}
            maxLength={6}
            disabled={loading}
            className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${
              isValid === true 
                ? 'border-green-500 bg-green-50' 
                : isValid === false 
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          {pincode && !loading && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={handleCheckClick}
          disabled={loading || pincode.length < 2}
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Checking...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Check Delivery
            </>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {pincodeData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-green-800">Delivery Available</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900 ml-2">{pincodeData.city}, {pincodeData.state}</span>
              </div>
              <div>
                <span className="text-gray-600">Transit:</span>
                <span className="font-medium text-gray-900 ml-2">{pincodeData.transitDays}</span>
              </div>
              <div>
                <span className="text-gray-600">Assembly:</span>
                <span className="font-medium text-gray-900 ml-2">{pincodeData.assemblyDays}</span>
              </div>
            </div>
          </div>
        )}

              </div>
    </div>
  );
}

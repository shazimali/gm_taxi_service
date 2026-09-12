'use client';

import { useEffect, useState } from 'react';
import type { PassengerProfile } from '../types';

export function usePassengerAuth() {
  const [passenger, setPassenger] = useState<PassengerProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Passenger Contact State
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const checkPassengerAuth = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch('/api/passenger/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.passenger) {
          setPassenger(data.passenger);
          setPassengerName(data.passenger.fullName || '');
          setPassengerEmail(data.passenger.email || '');
          setPassengerPhone(data.passenger.phone || '');
        } else {
          setPassenger(null);
        }
      } else {
        setPassenger(null);
      }
    } catch {
      setPassenger(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkPassengerAuth();
  }, []);

  const handlePassengerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/passenger/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      setPassenger(data.passenger);
      setPassengerName(data.passenger.fullName || '');
      setPassengerEmail(data.passenger.email || '');
      setPassengerPhone(data.passenger.phone || '');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePassengerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/passenger/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setPassenger(data.passenger);
      setPassengerName(data.passenger.fullName || '');
      setPassengerEmail(data.passenger.email || '');
      setPassengerPhone(data.passenger.phone || '');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    passenger,
    checkingAuth,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    regFullName,
    setRegFullName,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    regPhone,
    setRegPhone,
    authError,
    setAuthError,
    authLoading,
    passengerName,
    setPassengerName,
    passengerEmail,
    setPassengerEmail,
    passengerPhone,
    setPassengerPhone,
    specialRequests,
    setSpecialRequests,
    handlePassengerLogin,
    handlePassengerRegister,
  };
}

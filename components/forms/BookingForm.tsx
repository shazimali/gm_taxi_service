'use client';

import { FLEET_DATA } from '@/data/fleetData';
import { sendBookingQuote } from '@/lib/actions/sendBookingQuote';
import { AlertCircle, ArrowRight, CheckCircle2, MapPin, Navigation, ShieldCheck, Loader2, CreditCard, Lock, User, KeyRound, LogIn, UserPlus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const POPULAR_LOCATIONS = [
  'Boston Logan International Airport (BOS) - Terminal A',
  'Boston Logan International Airport (BOS) - Terminal B',
  'Boston Logan International Airport (BOS) - Terminal C',
  'Boston Logan International Airport (BOS) - Terminal E (International)',
  'Hanscom Field Private Aviation (BED) - Bedford, MA',
  'T.F. Green International Airport (PVD) - Providence, RI',
  'Manchester-Boston Regional Airport (MHT) - Manchester, NH',
  'Worcester Regional Airport (ORH) - Worcester, MA',
  'John F. Kennedy International Airport (JFK) - New York, NY',
  'LaGuardia Airport (LGA) - New York, NY',
  'Newark Liberty International Airport (EWR) - Newark, NJ',
  'Back Bay & Copley Square, Boston, MA',
  'Downtown Financial District, Boston, MA',
  'Seaport District & Waterfront, Boston, MA',
  'Harvard Square, Cambridge, MA',
  'Kendall Square Biotech Hub, Cambridge, MA',
  'Chestnut Hill & Newton, MA',
  'Wellesley & Weston Executive Belt, MA',
  'Lexington & Concord, MA',
  'Suburban Westborough & Framingham, MA',
  'Midtown Manhattan & Times Square, New York, NY',
  'Penn Station & Hudson Yards, New York, NY',
];

interface LocationResult {
  display_name: string;
}

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('Airport Transportation');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET_DATA[0].slug);

  // Route Inputs & Autocomplete State
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupFinalized, setPickupFinalized] = useState(false);
  const [dropoffFinalized, setDropoffFinalized] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>(POPULAR_LOCATIONS);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>(POPULAR_LOCATIONS);

  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDropoff, setLoadingDropoff] = useState(false);

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('12:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [hourlyCount, setHourlyCount] = useState(3);
  const [flightNumber, setFlightNumber] = useState('');

  // Distance & Duration Calculation State
  const [estimatedMiles, setEstimatedMiles] = useState(14.5);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  // Passenger Auth & Saved Cards State
  const [passenger, setPassenger] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth Form Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Passenger Contact & Payment State
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Saved Cards
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('new');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');

  const [status, setStatus] = useState<{ success?: boolean; confirmationNumber?: string; message?: string; error?: string }>({});
  const [loading, setLoading] = useState(false);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Check Passenger Auth & Saved Cards
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
          fetchSavedCards();
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

  const fetchSavedCards = async () => {
    try {
      const res = await fetch('/api/passenger/cards');
      if (res.ok) {
        const data = await res.json();
        const cards = data.cards || [];
        setSavedCards(cards);
        if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
        } else {
          setSelectedCardId('new');
        }
      }
    } catch (e) {
      console.error('Failed to fetch saved cards:', e);
    }
  };

  useEffect(() => {
    checkPassengerAuth();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickupContainerRef.current && !pickupContainerRef.current.contains(e.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropoffContainerRef.current && !dropoffContainerRef.current.contains(e.target as Node)) {
        setShowDropoffDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Location Search for Pickup
  useEffect(() => {
    if (!pickup || pickup.trim().length < 2) {
      setPickupSuggestions(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingPickup(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}&limit=6&addressdetails=1`);
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            const liveResults = data.map((item) => item.display_name);
            setPickupSuggestions(liveResults);
          } else {
            setPickupSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase())));
          }
        } else {
          setPickupSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase())));
        }
      } catch (err) {
        setPickupSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(pickup.toLowerCase())));
      } finally {
        setLoadingPickup(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [pickup]);

  // Live Location Search for Dropoff
  useEffect(() => {
    if (!dropoff || dropoff.trim().length < 2) {
      setDropoffSuggestions(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingDropoff(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}&limit=6&addressdetails=1`);
        if (res.ok) {
          const data: LocationResult[] = await res.json();
          if (data && data.length > 0) {
            const liveResults = data.map((item) => item.display_name);
            setDropoffSuggestions(liveResults);
          } else {
            setDropoffSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase())));
          }
        } else {
          setDropoffSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase())));
        }
      } catch (err) {
        setDropoffSuggestions(POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(dropoff.toLowerCase())));
      } finally {
        setLoadingDropoff(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [dropoff]);

  // Estimate distance and travel time based on pickup & dropoff strings
  useEffect(() => {
    if (!pickup || !dropoff) return;

    const p = pickup.toLowerCase();
    const d = dropoff.toLowerCase();

    let miles = 15.0;
    let mins = 30;

    if (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) {
      if (p.includes('nyc') || d.includes('nyc') || p.includes('jfk') || d.includes('jfk') || p.includes('york') || d.includes('york')) {
        miles = 215.0;
        mins = 240;
      } else if (p.includes('providence') || d.includes('providence') || p.includes('pvd') || d.includes('pvd')) {
        miles = 58.0;
        mins = 65;
      } else if (p.includes('cambridge') || d.includes('cambridge')) {
        miles = 8.5;
        mins = 20;
      } else if (p.includes('newton') || d.includes('newton')) {
        miles = 14.0;
        mins = 32;
      } else if (p.includes('lexington') || d.includes('lexington')) {
        miles = 18.5;
        mins = 38;
      } else {
        miles = 12.5;
        mins = 28;
      }
    } else if (p.includes('nyc') || d.includes('nyc') || p.includes('manhattan') || d.includes('manhattan')) {
      miles = 215.0;
      mins = 240;
    } else if (p.includes('worcester') || d.includes('worcester')) {
      miles = 45.0;
      mins = 50;
    } else {
      miles = 16.0;
      mins = 35;
    }

    setEstimatedMiles(miles);
    setEstimatedMinutes(mins);
  }, [pickup, dropoff]);

  const chosenVehicleObj = FLEET_DATA.find((v) => v.slug === selectedVehicle) || FLEET_DATA[0];

  // System calculated price function
  const calculateVehiclePrice = (vehicle: typeof FLEET_DATA[0]) => {
    const rate = vehicle.rateHourly || 85;

    if (selectedService.includes('Hourly')) {
      const total = rate * Math.max(2, hourlyCount);
      return {
        totalPrice: total.toFixed(2),
        durationLabel: `${hourlyCount} Hours Requested`,
        formulaLabel: `$${rate}/hr × ${hourlyCount} hrs`,
      };
    } else {
      const hoursDecimal = Math.max(1.5, Math.ceil((estimatedMinutes / 60) * 2) / 2);
      const total = rate * hoursDecimal;
      return {
        totalPrice: total.toFixed(2),
        durationLabel: `${estimatedMinutes} mins (~${hoursDecimal} hrs)`,
        formulaLabel: `$${rate}/hr × ${hoursDecimal} hrs`,
      };
    }
  };

  const currentVehiclePrice = calculateVehiclePrice(chosenVehicleObj);

  // Handle Inline Passenger Login
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
      fetchSavedCards();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Inline Passenger Registration
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
      fetchSavedCards();
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Reservation & Pre-Authorization Hold Submission
  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passenger) {
      alert('Please log in or register as a passenger before confirming your reservation.');
      return;
    }

    setLoading(true);
    setStatus({});

    const formData = new FormData();
    const serviceLabel = selectedService.includes('Hourly') ? `${selectedService} (${hourlyCount} Hours)` : selectedService;

    formData.set('fullName', passengerName || passenger.fullName);
    formData.set('email', passengerEmail || passenger.email);
    formData.set('phone', passengerPhone || passenger.phone || '');
    formData.set('serviceType', serviceLabel);
    formData.set('vehicleSlug', selectedVehicle);
    formData.set('pickupLocation', pickup);
    formData.set('dropoffLocation', dropoff);
    formData.set('pickupDate', pickupDate);
    formData.set('pickupTime', pickupTime);
    formData.set('passengers', passengers.toString());
    formData.set('luggage', luggage.toString());
    formData.set('flightNumber', flightNumber);
    formData.set('estimatedPrice', currentVehiclePrice.totalPrice);

    // Create Stripe Pre-Authorization Hold (manual capture)
    try {
      const intentRes = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentVehiclePrice.totalPrice,
          vehicleSlug: selectedVehicle,
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          paymentMethodId: selectedCardId !== 'new' ? selectedCardId : undefined,
        }),
      });

      if (intentRes.ok) {
        const intentData = await intentRes.json();
        if (intentData.paymentIntentId) {
          formData.set('stripePaymentIntentId', intentData.paymentIntentId);
          formData.set('paymentStatus', 'HOLD_PLACED');
        }
      }
    } catch (holdErr) {
      console.warn('Payment hold creation warning:', holdErr);
    }

    const calcNotes = `Calculated Distance: ${estimatedMiles} miles | Duration: ${estimatedMinutes} mins | System Estimated Price: $${currentVehiclePrice.totalPrice}`;
    formData.set('specialRequests', specialRequests ? `${specialRequests} [${calcNotes}]` : calcNotes);

    const result = await sendBookingQuote({}, formData);

    setLoading(false);
    setStatus(result);
  }

  const isBothLocationsFinal = pickupFinalized && dropoffFinalized && pickup.trim().length >= 3 && dropoff.trim().length >= 3;
  const mapOrigin = encodeURIComponent(pickup || 'Boston Logan Airport');
  const mapDestination = encodeURIComponent(dropoff || 'Boston MA');
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=from+${mapOrigin}+to+${mapDestination}&output=embed`;

  return (
    <div className="contact-form-wrap">
      {/* ── Step Indicator Bar ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: step >= 1 ? '#c5a46d' : '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)' : '#1e293b', color: step >= 1 ? '#0b0f17' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            1
          </div>
          <span>1. Service</span>
        </div>

        <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #c5a46d 0%, #d4af37 100%)', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', transition: 'all 0.3s ease' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: step >= 2 ? '#c5a46d' : '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)' : '#1e293b', color: step >= 2 ? '#0b0f17' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            2
          </div>
          <span>2. Vehicle</span>
        </div>

        <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #c5a46d 0%, #d4af37 100%)', width: step === 3 ? '100%' : '0%', transition: 'all 0.3s ease' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: step >= 3 ? '#c5a46d' : '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)' : '#1e293b', color: step >= 3 ? '#0b0f17' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            3
          </div>
          <span>3. Confirmation</span>
        </div>
      </div>

      {status.success ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)', color: '#0b0f17', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(197, 164, 109, 0.3)' }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Reservation Request Submitted!
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '440px', lineHeight: 1.6, margin: '0 auto' }}>
            {status.message}
          </p>

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(197, 164, 109, 0.3)', borderRadius: '14px', padding: '1.25rem', width: '100%', maxWidth: '460px', margin: '1rem 0', textAlign: 'left' }}>
            <div style={{ color: '#c5a46d', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Confirmation Code: {status.confirmationNumber}</span>
              <span style={{ backgroundColor: '#c5a46d', color: '#0b0f17', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' }}>Est. Total: ${currentVehiclePrice.totalPrice}</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong style={{ color: '#ffffff' }}>Passenger:</strong> {passengerName || passenger?.fullName}</div>
              <div><strong style={{ color: '#ffffff' }}>Service:</strong> {selectedService}</div>
              <div><strong style={{ color: '#ffffff' }}>Vehicle:</strong> {chosenVehicleObj.name}</div>
              <div><strong style={{ color: '#ffffff' }}>Pickup (Start Point):</strong> {pickup}</div>
              <div><strong style={{ color: '#ffffff' }}>Destination (End Point):</strong> {dropoff || 'City Centre'}</div>
              <div><strong style={{ color: '#ffffff' }}>Distance &amp; Time:</strong> {estimatedMiles} miles ({estimatedMinutes} mins)</div>
              <div><strong style={{ color: '#ffffff' }}>Payment Status:</strong> 🔒 Hold Placed (Manual Capture)</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setStatus({});
              setPickup('');
              setDropoff('');
              setPickupFinalized(false);
              setDropoffFinalized(false);
            }}
            className="btn btn--gold"
            style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}
          >
            Book Another Transfer
          </button>
        </div>
      ) : (
        <div className="theme-form">
          {/* ── STEP 1: SERVICES DROPDOWN & LIVE SEARCH ROUTE ────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Services Dropdown */}
              <div className="form-group">
                <label className="form-label" style={{ color: '#ffffff' }}>
                  Select Service <span className="req">*</span>
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="form-select"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, borderColor: '#cbd5e1', fontSize: '0.95rem', height: '48px' }}
                >
                  <option value="Airport Transportation">✈️ Airport Transportation</option>
                  <option value="Hourly Private Chauffeur">🕐 Hourly Private Chauffeur</option>
                  <option value="Long Distance City-to-City Transfer">🗺️ Long Distance City-to-City Transfer</option>
                  <option value="Luxury Chauffeur & Limousine">👑 Luxury Chauffeur &amp; Limousine</option>
                  <option value="Event Limo Service">🎉 Event Limo Service</option>
                  <option value="Private Wedding Limo">💒 Private Wedding Limo</option>
                </select>
              </div>

              {/* Live Search Pickup & Dropoff Inputs */}
              <div className="form-row">
                {/* Pickup Location Field */}
                <div className="form-group" style={{ position: 'relative' }} ref={pickupContainerRef}>
                  <label className="form-label">
                    Pickup Location <span className="req">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={pickup}
                      onFocus={() => setShowPickupDropdown(true)}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setPickupFinalized(false);
                        setShowPickupDropdown(true);
                      }}
                      onBlur={() => {
                        if (pickup.trim().length >= 3) setPickupFinalized(true);
                      }}
                      placeholder="Type location, airport, or hotel name..."
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    {loadingPickup && (
                      <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c5a46d' }} />
                    )}
                  </div>

                  {/* Pickup Live Search Dropdown */}
                  {showPickupDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        marginTop: '4px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        maxHeight: '230px',
                        overflowY: 'auto',
                      }}
                    >
                      {pickupSuggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setPickup(loc);
                            setPickupFinalized(true);
                            setShowPickupDropdown(false);
                          }}
                          style={{
                            padding: '0.65rem 1rem',
                            fontSize: '0.825rem',
                            color: '#0f172a',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500,
                            lineHeight: 1.4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <MapPin size={15} style={{ color: '#b8860b', flexShrink: 0 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drop-off Location Field */}
                <div className="form-group" style={{ position: 'relative' }} ref={dropoffContainerRef}>
                  <label className="form-label">
                    Drop-off Location <span className="req">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={dropoff}
                      onFocus={() => setShowDropoffDropdown(true)}
                      onChange={(e) => {
                        setDropoff(e.target.value);
                        setDropoffFinalized(false);
                        setShowDropoffDropdown(true);
                      }}
                      onBlur={() => {
                        if (dropoff.trim().length >= 3) setDropoffFinalized(true);
                      }}
                      placeholder="Type destination, address, or city..."
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    {loadingDropoff && (
                      <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c5a46d' }} />
                    )}
                  </div>

                  {/* Dropoff Live Search Dropdown */}
                  {showDropoffDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        marginTop: '4px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        maxHeight: '230px',
                        overflowY: 'auto',
                      }}
                    >
                      {dropoffSuggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setDropoff(loc);
                            setDropoffFinalized(true);
                            setShowDropoffDropdown(false);
                          }}
                          style={{
                            padding: '0.65rem 1rem',
                            fontSize: '0.825rem',
                            color: '#0f172a',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500,
                            lineHeight: 1.4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <MapPin size={15} style={{ color: '#b8860b', flexShrink: 0 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Google Map Route Preview */}
              {isBothLocationsFinal && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b8860b', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Navigation size={18} />
                      <span>Google Map Route &amp; Distance Matrix</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#334155' }}>
                      <span>Distance: <strong style={{ color: '#b8860b', fontWeight: 800 }}>{estimatedMiles} Miles</strong></span>
                      <span>Duration: <strong style={{ color: '#b8860b', fontWeight: 800 }}>{estimatedMinutes} Mins</strong></span>
                    </div>
                  </div>

                  <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <iframe
                      src={googleMapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Google Route Preview"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Date, Time & Options */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Transfer Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pickup Time <span className="req">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                {selectedService.includes('Hourly') ? (
                  <div className="form-group">
                    <label className="form-label">Requested Hours (Min 2 Hrs)</label>
                    <select
                      value={hourlyCount}
                      onChange={(e) => setHourlyCount(Number(e.target.value))}
                      className="form-select"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 24].map((num) => (
                        <option key={num} value={num}>
                          {num} Hours Dedicated Chauffeur
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Flight Tail # (If Airport Pickup)</label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="e.g. DL 1420 (Flight status tracking)"
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Passengers</label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="form-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
                      <option key={num} value={num}>
                        {num} Passengers
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Luggage Bags</label>
                  <select
                    value={luggage}
                    onChange={(e) => setLuggage(Number(e.target.value))}
                    className="form-select"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Suitcases
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!pickup || !dropoff || !pickupDate) {
                    alert('Please provide Pickup (Start Point), Drop-off (Destination) and Transfer Date.');
                    return;
                  }
                  setPickupFinalized(true);
                  setDropoffFinalized(true);
                  setStep(2);
                }}
                className="btn btn--gold btn--full"
                style={{ height: '52px', marginTop: '0.5rem', fontSize: '0.925rem' }}
              >
                <span>Calculate Rate &amp; Select Vehicle</span>
                <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          )}

          {/* ── STEP 2: VEHICLE SELECTION & CALCULATED PRICE ──────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Select Vehicle &amp; System Calculated Price
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                    Calculated for {estimatedMiles} miles / {estimatedMinutes} mins route from {pickup} to {dropoff}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ color: '#c5a46d', fontSize: '0.8rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Edit Route
                </button>
              </div>

              <div className="booking-vehicles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {FLEET_DATA.map((vehicle) => {
                  const isSelected = selectedVehicle === vehicle.slug;
                  const priceInfo = calculateVehiclePrice(vehicle);

                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.slug)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: isSelected ? '2px solid #b8860b' : '1px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 10px 30px rgba(184, 134, 11, 0.22)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <div style={{ height: '155px', overflow: 'hidden', position: 'relative', backgroundColor: '#0b0f17' }}>
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Calculated Price Badge */}
                        <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(11, 15, 23, 0.92)', color: '#c5a46d', border: '1px solid rgba(197, 164, 109, 0.5)', fontSize: '0.85rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '20px', backdropFilter: 'blur(6px)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                          ${priceInfo.totalPrice}
                        </span>

                        {isSelected && (
                          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#b8860b', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase' }}>
                            ✓ Selected
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b8860b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {vehicle.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            {priceInfo.formulaLabel}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                          {vehicle.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem 0' }}>
                          {vehicle.model}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontWeight: 600 }}>
                          <span>👥 {vehicle.passengerCapacity} Passengers</span>
                          <span>🧳 {vehicle.luggageCapacity} Bags</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn--gold"
                  style={{ flex: 2, height: '50px', fontSize: '0.9rem' }}
                >
                  <span>Proceed to Payment Hold (${currentVehiclePrice.totalPrice})</span>
                  <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PASSENGER LOGIN & STRIPE PAYMENT HOLD ───────── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Passenger Verification &amp; Payment Hold
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ color: '#c5a46d', fontSize: '0.8rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Change Vehicle
                </button>
              </div>

              {/* Trip Summary Badge */}
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(197, 164, 109, 0.4)', borderRadius: '14px', padding: '1.15rem 1.35rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Trip Service</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{selectedService}</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Selected Fleet</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{chosenVehicleObj.name}</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Route Matrix</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{estimatedMiles} miles ({estimatedMinutes} mins)</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Calculated Total Fare</span>
                  <strong style={{ color: '#c5a46d', fontSize: '1.15rem', fontWeight: 800 }}>${currentVehiclePrice.totalPrice}</strong>
                </div>
              </div>

              {/* ── CASE 1: PASSENGER NOT LOGGED IN ──────────────── */}
              {!passenger ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #cbd5e1', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <Lock size={20} color="#b8860b" />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Passenger Login Required to Complete Payment Hold
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                        Sign in to use your saved cards or register a new passenger account.
                      </p>
                    </div>
                  </div>

                  {/* Auth Tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.35rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: authMode === 'login' ? '#ffffff' : 'transparent',
                        color: authMode === 'login' ? '#b8860b' : '#64748b',
                        boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <LogIn size={15} />
                      <span>Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: authMode === 'register' ? '#ffffff' : 'transparent',
                        color: authMode === 'register' ? '#b8860b' : '#64748b',
                        boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <UserPlus size={15} />
                      <span>Register Account</span>
                    </button>
                  </div>

                  {authError && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '10px', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: 600 }}>
                      ⚠️ {authError}
                    </div>
                  )}

                  {/* Form: Sign In */}
                  {authMode === 'login' && (
                    <form onSubmit={handlePassengerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#0f172a' }}>Email Address</label>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. john@example.com"
                          className="form-input"
                          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ color: '#0f172a' }}>Password</label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="form-input"
                          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="btn btn--gold"
                        style={{ height: '48px', fontSize: '0.9rem', width: '100%', marginTop: '0.25rem' }}
                      >
                        {authLoading ? 'Signing in...' : 'Sign In & Continue to Payment Hold'}
                      </button>
                    </form>
                  )}

                  {/* Form: Register */}
                  {authMode === 'register' && (
                    <form onSubmit={handlePassengerRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#0f172a' }}>Full Name</label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. John Smith"
                          className="form-input"
                          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label" style={{ color: '#0f172a' }}>Email Address</label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="form-input"
                            style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ color: '#0f172a' }}>Mobile Phone</label>
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="(617) 784-0264"
                            className="form-input"
                            style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ color: '#0f172a' }}>Password</label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="form-input"
                          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="btn btn--gold"
                        style={{ height: '48px', fontSize: '0.9rem', width: '100%', marginTop: '0.25rem' }}
                      >
                        {authLoading ? 'Creating Account...' : 'Register & Continue to Payment Hold'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* ── CASE 2: PASSENGER ALREADY LOGGED IN ──────────── */
                <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Logged-in Passenger Info Badge */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#b8860b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                        {passenger.fullName ? passenger.fullName.substring(0, 2).toUpperCase() : 'PS'}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Verified Passenger Account</span>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {passenger.fullName} ({passenger.email})
                        </h4>
                      </div>
                    </div>

                    <span style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                      ✓ Authenticated
                    </span>
                  </div>

                  {status.error && (
                    <div className="contact-alert contact-alert--error">
                      <AlertCircle size={20} className="contact-alert__icon" />
                      <span>{status.error}</span>
                    </div>
                  )}

                  {/* Passenger Contact Inputs */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address <span className="req">*</span></label>
                      <input
                        type="email"
                        required
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Mobile Phone Number <span className="req">*</span></label>
                      <input
                        type="tel"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="(617) 784-0264"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Special Requests or Child Seat</label>
                      <input
                        type="text"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="e.g. Quiet ride, infant rear-facing seat"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* ── SAVED CARDS VS NEW CARD SELECTION ────────────── */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #cbd5e1', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '0.95rem' }}>
                        <CreditCard size={18} color="#b8860b" />
                        <span>Select Card for Pre-Authorization Hold (${currentVehiclePrice.totalPrice})</span>
                      </div>
                    </div>

                    {/* Pre-Authorization Hold Explanatory Banner */}
                    <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <Lock size={18} color="#b8860b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.8rem', color: '#713f12', lineHeight: 1.5 }}>
                        <strong>🔒 Payment Pre-Authorization Hold:</strong> Your card will be authorized for <strong>${currentVehiclePrice.totalPrice}</strong>. Funds are locked in reserve and <strong>NOT charged</strong> until your ride is completed by your chauffeur.
                      </div>
                    </div>

                    {/* Saved Cards List */}
                    {savedCards.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Saved Cards in Your Account
                        </label>

                        {savedCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            style={{
                              padding: '0.85rem 1.15rem',
                              borderRadius: '12px',
                              border: selectedCardId === card.id ? '2px solid #b8860b' : '1px solid #cbd5e1',
                              backgroundColor: selectedCardId === card.id ? '#fefce8' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #b8860b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedCardId === card.id && (
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#b8860b' }} />
                                )}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block' }}>
                                  💳 {card.brand ? card.brand.toUpperCase() : 'CARD'} •••• {card.last4}
                                </strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Expires {card.expMonth}/{card.expYear}
                                </span>
                              </div>
                            </div>

                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b8860b' }}>
                              {selectedCardId === card.id ? '✓ Selected for Hold' : 'Use Card'}
                            </span>
                          </div>
                        ))}

                        {/* Option: Add New Card */}
                        <div
                          onClick={() => setSelectedCardId('new')}
                          style={{
                            padding: '0.85rem 1.15rem',
                            borderRadius: '12px',
                            border: selectedCardId === 'new' ? '2px solid #b8860b' : '1px dashed #cbd5e1',
                            backgroundColor: selectedCardId === 'new' ? '#fefce8' : '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #b8860b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedCardId === 'new' && (
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#b8860b' }} />
                            )}
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                            ➕ Add Different Credit / Debit Card for This Ride
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* New Card Form (Shown if no saved cards or user selects 'new') */}
                    {(savedCards.length === 0 || selectedCardId === 'new') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: savedCards.length > 0 ? '1rem' : 0, paddingTop: savedCards.length > 0 ? '1rem' : 0, borderTop: savedCards.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ color: '#0f172a' }}>Card Number</label>
                          <input
                            type="text"
                            placeholder="4242 •••• •••• 4242"
                            value={newCardNumber}
                            onChange={(e) => setNewCardNumber(e.target.value)}
                            className="form-input"
                            style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label" style={{ color: '#0f172a' }}>Expiration (MM/YY)</label>
                            <input
                              type="text"
                              placeholder="12/28"
                              value={newCardExp}
                              onChange={(e) => setNewCardExp(e.target.value)}
                              className="form-input"
                              style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ color: '#0f172a' }}>CVC / CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              value={newCardCvc}
                              onChange={(e) => setNewCardCvc(e.target.value)}
                              className="form-input"
                              style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{ flex: 1, height: '54px', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn--gold"
                      style={{ flex: 2, height: '54px', fontSize: '0.95rem' }}
                    >
                      {loading ? (
                        <span>Processing Payment Hold...</span>
                      ) : (
                        <>
                          <span>Confirm &amp; Place Payment Hold (${currentVehiclePrice.totalPrice})</span>
                          <ShieldCheck size={18} style={{ marginLeft: '0.5rem' }} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

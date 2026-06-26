import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { 
  Loader2, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  Check, 
  Star, 
  Camera, 
  Clock, 
  Award, 
  Users, 
  Film, 
  HelpCircle, 
  Send, 
  MessageSquare, 
  ChevronDown, 
  Info,
  Layers,
  Heart
} from 'lucide-react';

const serviceImages = {
  'Wedding Photography': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Pre-Wedding Shoot': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Engagement Photography': 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Reception Photography': 'https://images.unsplash.com/photo-1519225495810-7517c24a2ed7?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Haldi Ceremony': 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Mehendi Photography': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Birthday Photography': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Maternity Shoot': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Baby Shoot': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Corporate Events': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Fashion Photography': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Product Photography': 'https://images.unsplash.com/photo-1505232458627-5ec90e586b9c?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Event Photography': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Drone Photography': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80&fm=webp',
  'Cinematic Videography': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80&fm=webp'
};

export const Services = () => {
  const { addToCart } = useCart();
  const { apiUrl } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustoms, setSelectedCustoms] = useState({});
  const [toast, setToast] = useState(null);

  // Modal display state for "Learn More"
  const [activeInfoPackage, setActiveInfoPackage] = useState(null);

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/packages`);
        const data = await res.json();
        // Sort packages so Wedding Photography, Pre-Wedding, etc. are ordered nicely
        const sorted = data.sort((a, b) => {
          const order = Object.keys(serviceImages);
          const indexA = order.indexOf(a.name);
          const indexB = order.indexOf(b.name);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setPackages(sorted);
      } catch (err) {
        console.error('Failed to retrieve photography packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [apiUrl]);

  const handleToggleCustom = (pkgId, option) => {
    setSelectedCustoms(prev => {
      const current = prev[pkgId] || [];
      const exists = current.some(opt => opt.id === option.id);
      let updated = exists 
        ? current.filter(opt => opt.id !== option.id) 
        : [...current, option];
      return { ...prev, [pkgId]: updated };
    });
  };

  const handleAddToCart = (pkg) => {
    const customs = selectedCustoms[pkg.id] || [];
    addToCart(pkg, customs);
    setToast({
      message: `"${pkg.name}" added to inquiry cart.`,
      type: 'success'
    });
    // Reset custom checkboxes
    setSelectedCustoms(prev => ({ ...prev, [pkg.id]: [] }));
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Static Details for additional sections
  const coreValues = [
    { icon: <Users className="w-5 h-5 text-gold" />, title: "500+ Happy Clients", desc: "Proudly documenting love stories, family moments, and corporate events since 2018." },
    { icon: <Award className="w-5 h-5 text-gold" />, title: "10+ Years Experience", desc: "Bringing editorial precision, high-fashion styling, and sharp focus to every event." },
    { icon: <Camera className="w-5 h-5 text-gold" />, title: "Professional Team", desc: "Equipped with industry-leading dual-slot cameras, premium prime lenses, and stabilizers." },
    { icon: <Layers className="w-5 h-5 text-gold" />, title: "Drone Coverage", desc: "Stunning high-altitude aerial perspectives of venues, entries, and outdoor events." },
    { icon: <Film className="w-5 h-5 text-gold" />, title: "4K Cinematic Videos", desc: "Expert slow-motion, color grading, and crisp sound design for gorgeous wedding films." },
    { icon: <Sparkles className="w-5 h-5 text-gold" />, title: "Premium Editing", desc: "Natural color matching, skin-tone balancing, and high-fashion editorial retouching." },
    { icon: <Clock className="w-5 h-5 text-gold" />, title: "On-Time Delivery", desc: "Receive your high-res digital gallery links and custom albums strictly on schedule." },
    { icon: <Heart className="w-5 h-5 text-gold" />, title: "Affordable Packages", desc: "Premium quality and transparent pricing structured to support customized booking choices." }
  ];

  const processStages = [
    { title: "Contact Us", desc: "Send an inquiry with your planned dates and Hyderabad location details." },
    { title: "Consultation", desc: "An in-depth call to discuss themes, schedules, and custom preferences." },
    { title: "Package Selection", desc: "Finalize customized terms, add-ons, and pricing breakdowns." },
    { title: "Booking Confirmation", desc: "Reserve your date officially with a secure confirmation receipt." },
    { title: "Photography Session", desc: "Our professional photographers capture your live moments seamlessly." },
    { title: "Professional Editing", desc: "Post-production retouching and professional cinematic color grading." },
    { title: "Final Delivery", desc: "Receive your high-resolution digital galleries and hardbound albums." }
  ];

  const testimonials = [
    { name: "Harika & Sravan", location: "Taj Falaknuma Palace", rating: 5, quote: "Pellipusthakam didn't just photograph our wedding; they archived our emotions. Looking through our album feels like reliving our special day all over again!" },
    { name: "Rohit Kumar", location: "HICC Novotel", rating: 5, quote: "Extremely professional coverage of our tech summit. The candid networking shots and keynote presentation frames are of outstanding editorial quality." },
    { name: "Deepika & Anirudh", location: "Fort Grand, Hyderabad", rating: 5, quote: "Our pre-wedding shoot was pure magic! They guided us through natural, romantic poses and caught the sunset reflections beautifully. Highly recommend!" },
    { name: "Sneha Reddy", location: "Jubilee Hills", rating: 5, quote: "Booked them for my baby's first birthday. The balloon stage decoration looked vibrant and the photographer was incredibly patient capturing toddler smiles." },
    { name: "Priya & Vivek", location: "N Convention", rating: 5, quote: "The cinematic wedding film they created was masterpiece! The sound design, drone shots, and color grade make it look like a high-end commercial movie." }
  ];

  const faqs = [
    { q: "How do I book?", a: "Simply browse our services page, select the desired package(s) and any customization options, click 'Book Now' to add to your cart, and fill in the secure checkout form. We will contact you immediately to schedule a consultation." },
    { q: "Do you travel?", a: "Yes, we are based in Hyderabad but our professional team travels worldwide for destination weddings and corporate events. Outstation travel and lodging fees are calculated during client consultation." },
    { q: "Do you provide drone photography?", a: "Yes! High-altitude aerial drone coverage is available as a standard inclusion in several services (like Weddings, Pre-Wedding) or can be selected as a custom add-on option for any package." },
    { q: "Delivery time?", a: "We deliver a teaser highlight reel and sneak-peek digital photos within 7-10 days of your event. The complete fully-edited photo gallery and printed Canvera albums are delivered within 4-6 weeks." },
    { q: "Payment process?", a: "We require a 30% advance booking fee to lock the date, 50% on the event date, and the remaining 20% balance upon delivery of edited digital assets." },
    { q: "Can I customize packages?", a: "Absolutely! You can choose standard packages and configure custom add-on choices (like drone, leather albums, or express delivery) dynamically during cart selection or request specific custom adjustments during consultation." }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen pt-32 pb-24 text-stone-300 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        
        {/* 1. Header Banner */}
        <div className="text-center space-y-5 animate-fade-in">
          <span className="text-xs tracking-[0.4em] text-gold uppercase font-semibold block">
            PREMIUM STUDIO SERVICES
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase">
            EXPLORE OUR PORTFOLIO SPECIALTIES
          </h1>
          <p className="text-xs md:text-sm text-stone-400 font-sans max-w-xl mx-auto leading-relaxed font-light">
            Luxury photography and cinematic films customized to document traditional values, romantic journeys, corporate branding, and celebratory highlights around Hyderabad.
          </p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-2 animate-pulse-subtle" />
        </div>

        {/* 2. Dynamic Services Card Grid */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Developing pricing catalog...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg) => {
              const activeCustoms = selectedCustoms[pkg.id] || [];
              const coverImage = serviceImages[pkg.name] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
              
              // Base price and custom sum calculation
              const basePrice = parseFloat(pkg.price);
              const customsSum = activeCustoms.reduce((sum, opt) => sum + parseFloat(opt.price || 0), 0);
              const totalEstimatedPrice = basePrice + customsSum;

              // Parse list values
              const inclusions = Array.isArray(pkg.inclusions) 
                ? pkg.inclusions 
                : JSON.parse(pkg.inclusions || '[]');
              const customizations = Array.isArray(pkg.customization_options)
                ? pkg.customization_options
                : JSON.parse(pkg.customization_options || '[]');

              return (
                <div 
                  key={pkg.id}
                  className="bg-zinc-900/60 backdrop-blur-md border border-white/5 hover:border-gold/30 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5 relative group hover:-translate-y-2"
                >
                  {/* Image Header wrapper */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                    <img 
                      src={coverImage} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Floating Price Badge */}
                    <div className="absolute top-4 right-4 z-20 bg-zinc-950/90 backdrop-blur-md border border-gold/40 text-gold px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider font-sans">
                      Start: ₹{basePrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Content block */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Title */}
                      <h3 className="font-serif text-2xl text-white tracking-wide group-hover:text-gold transition-colors duration-300">
                        {pkg.name}
                      </h3>
                      
                      {/* Short Description */}
                      <p className="text-xs text-stone-400 leading-relaxed font-sans font-light">
                        {pkg.description}
                      </p>

                      {/* Inclusions features list */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] tracking-wider text-stone-500 uppercase font-semibold block">Key Features</span>
                        <ul className="grid grid-cols-1 gap-1.5 text-xs text-stone-300 font-light">
                          {inclusions.slice(0, 7).map((inc, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Customization Options Checkboxes */}
                      {customizations.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] tracking-wider text-stone-500 uppercase font-semibold block">Configure Add-ons</span>
                          <div className="flex flex-col gap-1.5">
                            {customizations.map((opt) => {
                              const isSelected = activeCustoms.some(item => item.id === opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => handleToggleCustom(pkg.id, opt)}
                                  className={`flex justify-between items-center p-2 rounded border text-[11px] transition-all duration-300 font-medium ${
                                    isSelected 
                                      ? 'border-gold bg-gold/5 text-gold' 
                                      : 'border-white/5 bg-zinc-950/40 text-stone-400 hover:text-white hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected ? 'border-gold bg-gold text-zinc-950' : 'border-stone-700'
                                    }`}>
                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                    </div>
                                    <span>{opt.name}</span>
                                  </div>
                                  <span>+₹{parseFloat(opt.price).toLocaleString('en-IN')}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Investment Estimate Display */}
                    <div className="border-t border-white/5 pt-4 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 bg-zinc-950/60 p-3.5 rounded border border-white/5">
                        <div className="text-left">
                          <span className="text-[9px] tracking-wider text-stone-550 uppercase block font-semibold">Total Estimate</span>
                          <span className="text-base font-bold text-white font-sans">
                            ₹{totalEstimatedPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {customsSum > 0 && (
                          <span className="text-[10px] text-gold font-medium font-sans mt-1 sm:mt-0">
                            +₹{customsSum.toLocaleString('en-IN')} Add-ons
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleAddToCart(pkg)}
                          className="flex-1 bg-gold hover:bg-gold-600 text-zinc-950 font-semibold py-3 text-xs tracking-widest uppercase transition-colors rounded-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Book Now
                        </button>
                        <button
                          onClick={() => setActiveInfoPackage(pkg)}
                          className="border border-white/10 hover:border-white/30 text-stone-300 hover:text-white bg-white/5 px-4 py-3 rounded-sm text-xs transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Why Choose Pellipusthakam */}
        <section className="space-y-12 pt-12 border-t border-white/5">
          <div className="text-center space-y-3">
            <span className="text-xs tracking-widest text-gold uppercase font-semibold block">THE PELLIPUSTHAKAM ADVANTAGE</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide uppercase">WHY CHOOSE PELLIPUSTHAKAM?</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((val, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-white/5 p-6 rounded-lg text-left space-y-3 hover:border-gold/25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/25">
                  {val.icon}
                </div>
                <h3 className="font-serif text-lg text-white font-medium">{val.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed font-light">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Our Process */}
        <section className="space-y-12 pt-12 border-t border-white/5">
          <div className="text-center space-y-3">
            <span className="text-xs tracking-widest text-gold uppercase font-semibold block">STEP-BY-STEP WORKFLOW</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide uppercase">OUR WORK PROCESS</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="relative pl-6 sm:pl-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 text-left items-stretch">
            {processStages.map((stage, idx) => (
              <div key={idx} className="relative bg-zinc-900/30 border border-white/5 p-5 rounded-lg flex flex-col justify-between space-y-3 hover:border-gold/20 transition-all group shadow-sm">
                <div className="absolute -left-3.5 top-5 sm:static sm:left-0 sm:top-0 w-7 h-7 rounded-full bg-gold text-zinc-950 font-bold font-sans text-xs flex items-center justify-center shadow-lg">
                  {idx + 1}
                </div>
                <div className="space-y-1 sm:pt-2">
                  <h3 className="font-serif text-sm text-white group-hover:text-gold transition-colors duration-300 font-semibold">{stage.title}</h3>
                  <p className="text-[10px] text-stone-450 leading-relaxed font-light">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Elegant Testimonials */}
        <section className="space-y-12 pt-12 border-t border-white/5">
          <div className="text-center space-y-3">
            <span className="text-xs tracking-widest text-gold uppercase font-semibold block">COMMUNITY LOVE</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide uppercase">CLIENT TESTIMONIALS</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-white/5 p-6 rounded-lg text-left flex flex-col justify-between space-y-6 shadow-sm hover:border-gold/20 transition-all">
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="italic text-xs md:text-sm text-stone-300 leading-relaxed font-light">
                    "{test.quote}"
                  </p>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs">
                  <span className="font-serif text-gold block font-semibold">{test.name}</span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-medium">{test.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ Accordion */}
        <section className="space-y-12 pt-12 border-t border-white/5 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="text-xs tracking-widest text-gold uppercase font-semibold block">HAVE QUESTIONS?</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide uppercase">FREQUENTLY ASKED QUESTIONS</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-5 text-left text-xs md:text-sm text-white font-medium hover:text-gold transition-colors font-sans focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-48 border-t border-white/5' : 'max-h-0'
                    }`}
                  >
                    <p className="p-5 text-xs text-stone-400 leading-relaxed font-light font-sans">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Call To Action Full-width Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-gold/30 p-8 md:p-16 text-center space-y-6 shadow-2xl relative">
          {/* Subtle gold glow layers */}
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-6 flex flex-col items-center">
            <span className="text-[10px] tracking-[0.3em] text-gold uppercase font-bold">LET'S COMMENCE YOUR BOOKING</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide uppercase leading-tight">
              LET'S CAPTURE YOUR BEAUTIFUL MEMORIES
            </h2>
            <p className="text-xs md:text-sm text-stone-400 font-sans max-w-md mx-auto leading-relaxed font-light">
              Secure your date with Hyderabad's premier visual storytellers. Schedule a call, customize packages, and preserve your special frames.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Link 
                to="/checkout" 
                className="bg-gold text-zinc-950 hover:bg-gold-600 px-8 py-3.5 rounded-sm text-xs tracking-widest font-semibold uppercase transition-colors shadow-lg shadow-gold/15 flex items-center justify-center gap-2"
              >
                Book Now
              </Link>
              <button 
                onClick={() => {
                  const faqSection = document.querySelector('section:nth-of-type(4)');
                  if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-white/20 hover:border-gold/50 text-white bg-white/5 hover:bg-white/10 px-8 py-3.5 rounded-sm text-xs tracking-widest font-semibold uppercase transition-all flex items-center justify-center gap-2"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Details Info Modal Overlay */}
      {activeInfoPackage && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-zinc-900 border border-gold/40 max-w-lg w-full p-6 md:p-8 rounded-xl shadow-2xl space-y-6 text-left relative my-auto">
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-serif text-2xl text-white tracking-wide">{activeInfoPackage.name}</h3>
                <span className="text-xs text-gold font-bold font-sans mt-1 block">Starting Price: ₹{parseFloat(activeInfoPackage.price).toLocaleString('en-IN')}</span>
              </div>
              <button 
                onClick={() => setActiveInfoPackage(null)}
                className="text-stone-450 hover:text-white transition-colors p-1 bg-white/5 border border-white/10 hover:border-gold/30 rounded-full"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <p className="text-xs text-stone-450 leading-relaxed font-light font-sans">{activeInfoPackage.description}</p>

            <div className="space-y-3">
              <h4 className="text-[10px] tracking-wider text-stone-550 uppercase font-semibold block">Full Service Inclusions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 font-sans">
                {activeInfoPackage.inclusions && (Array.isArray(activeInfoPackage.inclusions) ? activeInfoPackage.inclusions : JSON.parse(activeInfoPackage.inclusions)).map((inc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeInfoPackage.customization_options && (Array.isArray(activeInfoPackage.customization_options) ? activeInfoPackage.customization_options : JSON.parse(activeInfoPackage.customization_options)).length > 0 && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-[10px] tracking-wider text-stone-550 uppercase font-semibold block">Custom Add-on Breakdown</h4>
                <div className="space-y-2 text-xs text-stone-400">
                  {(Array.isArray(activeInfoPackage.customization_options) ? activeInfoPackage.customization_options : JSON.parse(activeInfoPackage.customization_options)).map((opt) => (
                    <div key={opt.id} className="flex justify-between items-center bg-zinc-950/60 p-2 rounded">
                      <span className="font-medium text-stone-300">{opt.name}</span>
                      <span className="font-semibold text-gold">+₹{parseFloat(opt.price).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                handleAddToCart(activeInfoPackage);
                setActiveInfoPackage(null);
              }}
              className="w-full bg-gold hover:bg-gold-600 text-zinc-950 font-semibold py-3.5 text-xs tracking-widest uppercase transition-colors rounded-sm flex items-center justify-center gap-2"
            >
              Add Package to Cart
            </button>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Services;

import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Calendar, ArrowRight, Heart, Star, Sparkles } from 'lucide-react';

export const Home = () => {
  const categories = [
    {
      name: 'Weddings',
      desc: 'Eternal vows and traditional celebrations captured in all their grandeur.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      slug: 'weddings'
    },
    {
      name: 'Pre-Wedding Shoots',
      desc: 'Cinematic, candid romance in scenic locations around Hyderabad.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      slug: 'pre-wedding'
    },
    {
      name: 'Birthdays & Anniversaries',
      desc: 'Fun, candid, and memory-making frames for milestones.',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
      slug: 'birthdays'
    },
    {
      name: 'Corporate Events',
      desc: 'Professional visual logs for galas, launches, and summits.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
      slug: 'corporate'
    }
  ];

  const slideshowImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1519225495810-7517c24a259c?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1507504038482-7621c5f83c07?auto=format&fit=crop&w=2000&q=90'
  ];

  const [slideIndex, setSlideIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-28 pb-24 bg-luxury-bg">
      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-luxury-black">
        {/* Slideshow background layers */}
        {slideshowImages.map((src, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform ${
              slideIndex === idx ? 'opacity-40 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
        {/* Premium dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg via-luxury-black/30 to-luxury-black/80" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          <span className="text-xs md:text-sm tracking-[0.4em] text-gold uppercase font-semibold animate-fade-in-slow">
            CAPTURING YOUR FOREVER STORIES
          </span>
          <h1 className="text-4xl md:text-7xl font-serif text-white tracking-wider leading-tight uppercase max-w-3xl animate-slide-up">
            TELLING WEDDING TALES, BEAUTIFULLY
          </h1>
          <p className="text-sm md:text-base text-stone-300 font-sans max-w-xl leading-relaxed animate-fade-in font-light">
            We preserve emotional moments, delicate traditional values, and cinematic highlight archives that you will cherish for generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-slide-down">
            <Link 
              to="/portfolio" 
              className="bg-gold text-luxury-black px-8 py-3.5 rounded-sm text-xs tracking-widest font-semibold uppercase hover:bg-gold-600 transition-colors shadow-lg shadow-gold/25 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Explore Portfolio
            </Link>
            <Link 
              to="/services" 
              className="border border-white/20 hover:border-gold/60 text-white bg-white/5 hover:bg-white/10 px-8 py-3.5 rounded-sm text-xs tracking-widest font-semibold uppercase transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Studio Introduction */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden group border border-stone-200 shadow-xl bg-white p-3">
          <div className="relative w-full h-full rounded-md overflow-hidden">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10 duration-500" />
            <img 
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80" 
              alt="Pellipusthakam Photography Hyderabad team" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-10 left-10 z-20 bg-luxury-black/95 backdrop-blur-md px-6 py-4 rounded border border-white/10 text-left shadow-lg">
            <span className="font-serif text-lg text-gold block font-semibold">Est. 2018</span>
            <span className="text-[9px] text-stone-400 uppercase tracking-widest block font-medium">Hyderabad's Premier Visual Storytellers</span>
          </div>
        </div>

        <div className="space-y-8 text-left">
          <div className="space-y-3">
            <span className="text-xs tracking-widest text-gold uppercase font-semibold block">About Pellipusthakam</span>
            <h2 className="text-3xl md:text-5xl font-serif text-luxury-black tracking-wide leading-tight uppercase">
              WHERE LOVE MEETS COUTURE LENSES
            </h2>
            <div className="w-16 h-0.5 bg-gold" />
          </div>
          <p className="text-stone-600 leading-relaxed text-sm md:text-base font-light">
            Derived from the Telugu term meaning "Wedding Book", <strong className="font-semibold text-luxury-black">Pellipusthakam Photography</strong> is dedicated to documenting local cultures, authentic raw emotions, and beautiful bridal details in Hyderabad.
          </p>
          <p className="text-stone-500 leading-relaxed text-xs md:text-sm font-light">
            We operate beyond standard poses. Our professionals weave themselves seamlessly into your festivities, ensuring the tears, the giggles, and the energetic steps are frozen in visual poetry.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4 text-center border-t border-stone-200">
            <div className="space-y-1">
              <span className="text-2xl font-serif text-gold block font-bold">200+</span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Couples Welcomed</span>
            </div>
            <div className="border-x border-stone-200 px-4 space-y-1">
              <span className="text-2xl font-serif text-gold block font-bold">5+ Yrs</span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Experience</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-serif text-gold block font-bold">4.9/5</span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Google Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Studio Category Grid */}
      <section className="bg-white border-y border-stone-200/60 py-28 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs tracking-widest text-gold uppercase font-semibold block">Explore Galleries</span>
            <h2 className="text-3xl md:text-5xl font-serif text-luxury-black tracking-wide uppercase">
              OUR CAPTURED CATEGORIES
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="group relative bg-luxury-bg border border-stone-100 rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold/30 hover:shadow-xl transition-all duration-300 shadow-sm"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-luxury-black/10 group-hover:bg-luxury-black/0 transition-colors z-10 duration-300" />
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 text-left space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg text-luxury-black group-hover:text-gold transition-colors duration-300">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed font-light">
                      {cat.desc}
                    </p>
                  </div>
                  <Link 
                    to={`/portfolio`}
                    className="text-gold font-sans font-semibold text-[10px] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1.5 transition-transform self-start pt-2 border-b border-transparent hover:border-gold"
                  >
                    View Grid <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Mini Testimonial Quote */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-8">
        <Sparkles className="w-8 h-8 text-gold mx-auto opacity-70 animate-pulse-subtle" />
        <p className="font-serif text-2xl md:text-3.5xl italic text-luxury-black tracking-wide leading-relaxed">
          "Pellipusthakam didn't just photograph our wedding; they archived our emotions. Looking through our album feels like reliving our special day at the Falaknuma Palace all over again!"
        </p>
        <div className="space-y-2 pt-2">
          <span className="font-serif text-gold block font-bold text-lg tracking-wider uppercase">— Harika & Sravan</span>
          <span className="text-[10px] text-stone-550 uppercase tracking-widest block font-semibold">Wedding Couple, Hyderabad</span>
        </div>
      </section>
    </div>
  );
};

export default Home;

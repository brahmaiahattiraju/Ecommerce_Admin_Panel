/**
 * AURA AI Product Copywriter & Specification Engine
 * Generates compelling luxury descriptions, technical highlights, SEO tags,
 * and optimal pricing for catalog additions.
 */

export function generateAICopywriting({ name = '', tone = 'luxury', categories = [] }) {
  const cleanName = (name || 'Exclusive Tech Flagship').trim();
  const q = cleanName.toLowerCase();

  // 1. Automatic category determination
  let suggestedCategory = null;
  if (q.includes('phone') || q.includes('mobile') || q.includes('galaxy') || q.includes('iphone') || q.includes('oneplus') || q.includes('pixel')) {
    suggestedCategory = categories.find(c => c.slug === 'mobiles' || c.name?.toLowerCase().includes('mobile'));
  } else if (q.includes('headphone') || q.includes('audio') || q.includes('earbuds') || q.includes('airpods') || q.includes('speaker') || q.includes('sound')) {
    suggestedCategory = categories.find(c => c.slug === 'audio' || c.name?.toLowerCase().includes('audio'));
  } else if (q.includes('laptop') || q.includes('macbook') || q.includes('computer') || q.includes('tablet') || q.includes('ipad') || q.includes('pc')) {
    suggestedCategory = categories.find(c => c.slug === 'electronics' || c.name?.toLowerCase().includes('electronic'));
  } else if (q.includes('watch') || q.includes('fitness') || q.includes('band') || q.includes('ring')) {
    suggestedCategory = categories.find(c => c.slug === 'fitness' || c.name?.toLowerCase().includes('fit') || c.slug === 'electronics');
  } else if (q.includes('powerbank') || q.includes('battery') || q.includes('charger') || q.includes('anker')) {
    suggestedCategory = categories.find(c => c.slug === 'electronics' || c.name?.toLowerCase().includes('electronic'));
  } else if (q.includes('chair') || q.includes('lamp') || q.includes('desk') || q.includes('vase') || q.includes('home')) {
    suggestedCategory = categories.find(c => c.slug === 'home-living' || c.name?.toLowerCase().includes('home'));
  }

  if (!suggestedCategory && categories.length > 0) {
    suggestedCategory = categories[0];
  }

  // 2. Persona / Tone Templates
  let description = '';
  let bulletPoints = [];
  let suggestedPrice = 18999;
  let suggestedComparePrice = 24999;
  let seoTitle = `${cleanName} | Official AURA Luxury Edition`;
  let seoKeywords = ['flagship', 'luxury', 'precision-engineered', 'fast-delivery', 'aura-certified'];

  // Audio products
  if (q.includes('headphone') || q.includes('audio') || q.includes('earbuds') || q.includes('speaker')) {
    suggestedPrice = 24999;
    suggestedComparePrice = 29999;
    seoKeywords.push('active-noise-cancellation', 'lossless-audio', 'bluetooth-5.4', 'audiophile');

    if (tone === 'luxury') {
      description = `Crafted for discerning ears, the ${cleanName} harmonizes acoustic mastery with sculptural luxury. Featuring custom beryllium acoustic transducers, plush aerospace-grade memory cushions, and intelligent hybrid noise neutralization, it transports you to private concert halls with breathtaking dynamic range and effortless tactile control.`;
    } else if (tone === 'technical') {
      description = `Engineered with dual-core acoustic DSPs and high-excursion 40mm drivers, the ${cleanName} delivers ultra-low total harmonic distortion (<0.05%) across a 4Hz-45kHz frequency response. Supports LDAC, aptX Adaptive lossless streaming, and 45-hour continuous playback on a single USB-C charge.`;
    } else {
      description = `Elevate your daily rhythm with the ${cleanName}. Featuring crystal-clear calls, 40 hours of uninterrupted wireless playtime, and instant device switching, this is the definitive audio companion for work, travel, and studio listening.`;
    }

    bulletPoints = [
      'Custom 40mm Beryllium acoustic drivers delivering reference-grade studio acoustics and punchy sub-bass',
      'Adaptive Hybrid Active Noise Cancellation powered by dual feedback processors and 6 beamforming microphones',
      'Multipoint Bluetooth 5.4 with lossless LDAC and AAC codec support for seamless laptop and phone pairing',
      'Up to 45 hours of unbroken playtime with 10-minute RapidCharge giving 5 hours of instant listening',
      'Constructed from forged anodized aluminum and breathable memory foam for all-day weightless comfort'
    ];
  } 
  // Power banks & Chargers
  else if (q.includes('powerbank') || q.includes('battery') || q.includes('charger') || q.includes('anker')) {
    suggestedPrice = 9999;
    suggestedComparePrice = 14999;
    seoKeywords.push('gan-fast-charging', 'usb-c-pd3.1', 'high-capacity-battery', 'smart-display');

    if (tone === 'luxury') {
      description = `The ${cleanName} redefines portable energy with sleek aeronautical aluminum architecture and an intelligent real-time OLED telemetry dial. Delivering bi-directional rapid power delivery in an airline-compliant silhouette, it is an indispensable travel power companion for executive workflows.`;
    } else if (tone === 'technical') {
      description = `Powered by GaN III semiconductor architecture, the ${cleanName} provides up to 140W single-port PD 3.1 output and 250W multi-port combined throughput. Features an advanced smart digital display showing battery health, cycle count, and individual port wattage.`;
    } else {
      description = `Never run out of power on the move. The ${cleanName} fast-charges your laptop, phone, and tablet simultaneously with intelligent temperature monitoring and universal fast-charging protocols.`;
    }

    bulletPoints = [
      'Ultra-high 27,650mAh capacity permitted on all commercial airlines for uninterrupted global travel',
      'Blazing 140W USB-C Power Delivery 3.1 capable of charging MacBook Pro from 0 to 50% in just 28 minutes',
      'Real-Time TFT Smart Digital Display showing exact battery percentage, output wattage, and recharge time remaining',
      'Triple-port simultaneous output (2× USB-C + 1× USB-A) with ActiveShield 2.0 real-time temperature regulation',
      'Ergonomic brushed space-gray finish resistant to scratches, drops, and everyday friction'
    ];
  }
  // Phones & Mobiles
  else if (q.includes('phone') || q.includes('mobile') || q.includes('galaxy') || q.includes('iphone') || q.includes('oneplus') || q.includes('pixel')) {
    suggestedPrice = 79999;
    suggestedComparePrice = 89999;
    seoKeywords.push('flagship-smartphone', 'oled-120hz', 'pro-camera', '5g-unlocked');

    if (tone === 'luxury') {
      description = `The ${cleanName} is a pinnacle of contemporary industrial luxury, pairing precision Grade 5 titanium edges with ceramic-shielded glass. Its calibrated LTPO display and computational studio optics turn every interaction into a seamless sensory delight.`;
    } else {
      description = `Built for next-generation performance, the ${cleanName} integrates a flagship octa-core silicon processor, 120Hz ProMotion AMOLED display, and a 50MP periscope zoom sensor with 8K cinema video recording.`;
    }

    bulletPoints = [
      'Stunning 6.82-inch 2K LTPO AMOLED display with 1-120Hz adaptive refresh rate and 4500-nit peak outdoor brightness',
      'State-of-the-art 3nm processor delivering unmatched gaming frame rates and on-device generative intelligence',
      'Pro Triple-Camera array with 50MP 1-inch sensor, 3× optical periscope, and Hasselblad color science',
      '5400mAh dual-cell silicon-carbon battery with 100W SUPERVOOC and 50W AIRVOOC wireless fast charging',
      'Aerospace Grade 5 titanium chassis with IP68 dust and water immersion resistance'
    ];
  }
  // Smartwatches & Wearables
  else if (q.includes('watch') || q.includes('fitness') || q.includes('band')) {
    suggestedPrice = 32999;
    suggestedComparePrice = 39999;
    seoKeywords.push('smartwatch', 'amoled-always-on', 'ecg-sensor', 'titanium-gps');

    if (tone === 'luxury') {
      description = `Merging haute horlogerie aesthetics with biometric precision, the ${cleanName} is milled from solid titanium and protected by sapphire crystal. It delivers continuous health telemetry, sleep staging, and cellular autonomy without sacrificing elegance.`;
    } else {
      description = `The ultimate fitness and lifestyle companion, ${cleanName} features dual-frequency GPS, ECG cardiac rhythm alerts, 100-meter water resistance, and up to 72 hours of continuous multi-sport tracking.`;
    }

    bulletPoints = [
      'Corrosion-resistant titanium case with polished mirror bevels and scratch-proof sapphire crystal glass',
      'High-luminance LTPO AMOLED display with Always-On Mode visible even under direct desert sunlight',
      'Advanced biometric suite with continuous SpO2, clinical-grade ECG, and skin temperature sensors',
      'Precision Dual-Frequency L1+L5 GPS for centimeter-level route accuracy in dense urban environments',
      'Up to 72 hours of normal usage with magnetic fast charger restoring 80% charge in 45 minutes'
    ];
  }
  // Generic / Default Luxury Creation
  else {
    suggestedPrice = 14999;
    suggestedComparePrice = 19999;

    if (tone === 'luxury') {
      description = `Elevate your lifestyle with the ${cleanName}. Designed with obsessive attention to tactile finishes, minimalist form, and durable engineering, it delivers effortless luxury and peak reliability for modern living.`;
    } else if (tone === 'technical') {
      description = `Precision-machined from high-grade structural alloys, the ${cleanName} incorporates thermal-efficient internals and low-latency digital architecture tested to exacting industrial benchmarks.`;
    } else {
      description = `Discover exceptional everyday convenience with the ${cleanName}. Premium materials, verified durability, and seamless plug-and-play simplicity make this an essential upgrade.`;
    }

    bulletPoints = [
      'Precision-engineered from aerospace-grade structural alloys with scratch-resistant matte finish',
      'Optimized for seamless plug-and-play compatibility across all flagship mobile and laptop platforms',
      'Rigorous 50-point factory quality audit ensuring long-lasting performance and zero thermal degradation',
      'Energy-efficient architecture with intelligent automatic sleep mode and low standby draw',
      'Includes 2-Year Official AURA White-Glove Replacement Guarantee with 24/7 dedicated concierge assistance'
    ];
  }

  // Combine description with bullet points in description string if desired
  const formattedFullDescription = `${description}\n\nKey Highlights:\n• ${bulletPoints.join('\n• ')}`;

  return {
    name: cleanName,
    tone,
    description: formattedFullDescription,
    shortDescription: description,
    bulletPoints,
    suggestedPrice,
    suggestedComparePrice,
    suggestedCategory,
    seoTitle,
    seoKeywords: seoKeywords.join(', ')
  };
}

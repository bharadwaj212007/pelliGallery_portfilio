import dns from 'dns';
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
  console.log('🔮 Preloaded DNS Override: Using IPv4-first result order');
} else {
  console.log('🔮 Preloaded DNS Override: Using default system resolver');
}

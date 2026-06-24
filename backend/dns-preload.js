import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log('🔮 Preloaded DNS Override: Using Google DNS (8.8.8.8, 8.8.4.4)');

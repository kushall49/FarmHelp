// Quick script to check if user is logged in
// Run in browser console (F12) while app is open

(async function checkAuth() {
  console.log('=== CHECKING AUTHENTICATION ===');
  
  // Check AsyncStorage for token
  const token = await AsyncStorage.getItem('token');
  const user = await AsyncStorage.getItem('user');
  
  console.log('Token exists:', !!token);
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'NULL');
  console.log('User data:', user ? JSON.parse(user) : 'NULL');
  
  if (!token) {
    console.error('❌ NO TOKEN FOUND - USER NOT LOGGED IN!');
    console.log('Solution: Navigate to Login/Signup screen first');
  } else {
    console.log('✅ Token found - user is logged in');
  }
})();

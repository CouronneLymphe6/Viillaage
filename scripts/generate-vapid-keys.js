/**
 * Script to generate VAPID keys for Web Push notifications
 * 
 * Run this script with: node scripts/generate-vapid-keys.js
 * 
 * This will generate a pair of public/private VAPID keys that you need to add
 * to your .env file for push notifications to work.
 */

const webpush = require('web-push');

console.log('\n🔐 Generating VAPID keys for Web Push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('📋 Add these to your .env file:\n');
console.log('─────────────────────────────────────────────────────────────');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:contact@viillaage.fr`);
console.log('─────────────────────────────────────────────────────────────\n');

console.log('⚠️  IMPORTANT:');
console.log('   1. Copy the keys above to your .env file');
console.log('   2. Add them to your Vercel environment variables');
console.log('   3. Keep the VAPID_PRIVATE_KEY secret and never commit it to git');
console.log('   4. The NEXT_PUBLIC_VAPID_PUBLIC_KEY can be public (it\'s used in the browser)\n');

console.log('📚 For Vercel deployment:');
console.log('   1. Go to your project settings on Vercel');
console.log('   2. Navigate to Environment Variables');
console.log('   3. Add all three variables above');
console.log('   4. Redeploy your application\n');

console.log('✨ Done! Your push notifications are ready to be configured.\n');

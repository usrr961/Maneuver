/**
 * Demo script to test the pit assignments page with team data
 * Run this in the browser console to set up demo data
 */

import { setupDemoEventTeams, clearDemoEventTeams } from './teamUtils';

// Function to be called from browser console
(window as any).setupPitAssignmentsDemo = () => {
  console.log('🚀 Setting up Pit Assignments Demo Data...');
  setupDemoEventTeams();
  console.log('');
  console.log('✅ Demo setup complete!');
  console.log('💡 Navigate to the Pit Assignments page to see the demo data in action.');
  console.log('📋 You should see 3 demo events with teams available for assignment.');
};

(window as any).clearPitAssignmentsDemo = () => {
  console.log('🧹 Clearing Pit Assignments Demo Data...');
  clearDemoEventTeams();
  console.log('✅ Demo data cleared!');
};

// Auto-setup if this script is imported
if (typeof window !== 'undefined') {
  console.log('Pit Assignments demo functions available:');
  console.log('- setupPitAssignmentsDemo() - Create demo event teams');
  console.log('- clearPitAssignmentsDemo() - Clear demo event teams');
}

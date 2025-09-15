export interface PageHelpConfig {
  title: string;
  content: string[];
  useDialog?: boolean; // Optional flag to force dialog mode
  gifUrl?: string; // Optional GIF URL for tutorials
}

export const PAGE_HELP_CONFIG: Record<string, PageHelpConfig> = {
  "/": {
    title: "Welcome to Maneuver!",
    content: [
      "This is the home page of Maneuver, your comprehensive FRC scouting solution.",
      "To get started, you can load demo data to explore the app's features, or use the sidebar menu to navigate to different sections.",
      "Demo data includes 51 sample matches and 14 teams to help you understand how the scouting system works.",
      "Use the sidebar menu to access scouting forms, data management, and strategy tools.",
      "Each page has detailed help available via tooltips or dialogs.",
      "Click the ❓ icon on each page for quick tips or in-depth tutorials.",
      "Install the Maneuver app on your device for the best experience. On Android, go to the browser settings, enable 'Add to Home Screen', and follow the prompts. On Safari in iOS, use the share button and select 'Add to Home Screen'.",
      "For more information, visit our GitHub repository."
    ]
  },
  "/game-start": {
    title: "Game Start Setup",
    useDialog: true,
    content: [
      "![Game Start Demo](./assets/tutorials/game-start-demo.gif)",
      "This page is where you begin each scouting session by setting up match details.",
      "1. Make sure your scouter name is selected in the sidebar first",
      "2. Add or select an event name",
      "3. Enter the match number you're about to scout (match numbers will auto increment)",
      "5. Choose your alliance color (Red/Blue) based on your position",
      "6. Select the team number you'll be watching, enter a team number if match data is not available",
      "7. Double-check all information before proceeding to Auto phase",
      "Pro tip: Selecting your role will auto select alliance color and team slot to make selection faster."
    ]
  },
  "/auto-start": {
    title: "Autonomous Position Setup",
    useDialog: true,
    content: [
      "![Autonomous Demo](./assets/tutorials/auto-phase-demo.gif)",
      "Set up the robot's starting position for the autonomous phase.",
      "1. Look at the field map showing the starting zone positions",
      "2. Click on the field where your robot starts the match",
      "3. Confirm the correct position is selected (you'll see a green badge)",
      "4. Review the match details in the sidebar to ensure accuracy",
      "5. Click 'Continue to Auto Scoring' to begin tracking autonomous performance",
      "The starting position affects autonomous scoring opportunities and strategy analysis."
    ]
  },
  "/auto-scoring": {
    title: "Autonomous Scoring",
    useDialog: true,
    content: [
      "![Auto Scoring Demo](./assets/tutorials/auto-scoring-demo.gif)",
      "Record all scoring activities during the autonomous period (first 15 seconds).",
      "1. Use the Reef Scoring section to track coral placement on different reef levels",
      "2. Click coral pickup buttons when the robot collects coral pieces",
      "3. Record algae collection and processing in the Algae section",
      "4. Toggle 'Passed Starting Line' if the robot only leaves its starting zone",
      "5. Use the 'Undo Last Action' button to correct any mistakes",
      "6. Watch for the flashing 'Ending Soon!' indicator as auto period concludes",
      "The sidebar shows your recent actions and current match info for reference."
    ]
  },
  "/teleop-scoring": {
    title: "Teleoperated Scoring",
    useDialog: true,
    content: [
      "![Teleop Scoring Demo](./assets/tutorials/teleop-scoring-demo.gif)",
      "Record all scoring activities during the teleoperated period (2 minutes 15 seconds).",
      "1. Use the Reef Scoring section to track coral placement at different levels (L1, L2, L3, L4)",
      "2. Click pickup buttons when the robot collects coral or algae pieces",
      "3. Track algae processing and net scoring in the Algae section",
      "4. Toggle 'Played Defense' when the robot actively defends against opponents",
      "5. Monitor the 'Recent Actions' sidebar to verify your entries",
      "6. Use 'Undo Last Action' to correct any recording errors",
      "7. Click 'Continue to Endgame' when your robot heads to perform endgame actions",
      "Pro tip: The current coral/algae counts show what the robot is currently holding."
    ]
  },
  "/endgame": {
    title: "Endgame",
    useDialog: true,
    content: [
      "![Endgame Demo](./assets/tutorials/endgame-demo.gif)",
      "Complete the match by recording endgame activities and final observations.",
      "1. In the Climbing section, select one option: Shallow Climb, Deep Climb, or Park",
      "2. Mark any issues that occurred: 'Climb Failed' or 'Broke Down'",
      "3. Add detailed comments about robot performance, strategy, or notable events",
      "4. Review the match summary to ensure all information is correct",
      "5. Click 'Submit Match Data' to save the complete scouting report",
      "Your data will be saved and you'll return to Game Start for the next match."
    ]
  },
  "/team-stats": {
    title: "Team Statistics",
    content: [
      "Analyze team performance across all scouted matches.",
      "1. Select a team from the dropdown to view its stats.",
      "2. View key metrics average total points, scoring by location, auto positions, pit scouting data, and comments",
      "3. Use the Compare to feature to analyze performance against other teams.",
      "4. Use the event filter to narrow down stats by specific events.",
      "This data helps with alliance selection and match strategy planning."
    ]
  },
  "/match-strategy": {
    title: "Match Strategy",
    content: [
      "Plan strategy for upcoming matches using scouted data.",
      "1. Draw on the field to visualize robot paths and scoring zones.",
      "2. Switch tabs to strategize scoring and paths for different phases of the game",
      "3. Enter the teams on each alliance or enter a match number to auto-fill the data.",
      "4. Compare alliance abilities in each phase of the game.",
      "Pro tip: Using the save all button will create an image with all drawings from each phase, team numbers, and match number"
    ]
  },
  "/pick-list": {
    title: "Pick Lists & Alliance Selection",
    useDialog: true,
    content: [
      "Create and manage team ranking lists for alliance selection with integrated alliance management.",
      "",
      "**Pick List Management:**",
      "1. **Create Lists** - Use the 'Create Pick List' section to add new ranking lists with custom names and descriptions",
      "2. **Multiple Lists** - Create specialized lists (e.g., 'Auto Specialists', 'Climb Masters', 'Versatile Teams')",
      "3. **Add Teams** - Click the '+' button next to any team in Available Teams to add them to a pick list",
      "4. **Reorder Teams** - Drag and drop teams within pick lists to adjust their priority ranking",
      "5. **Delete Teams** - Remove teams from lists or delete entire lists when no longer needed",
      "6. **Empty State** - When no pick lists exist, you'll see helpful guidance to create your first list",
      "",
      "**Team Analysis:**",
      "• **Available Teams Panel** - Browse all teams with comprehensive statistics and sorting options",
      "• **Sort Options** - Order teams by number, total coral, algae, auto performance, climb rate, and more",
      "• **Search Filter** - Quickly find specific teams using the search box",
      "• **Performance Stats** - View detailed metrics for each team including averages and match counts",
      "",
      "**Alliance Selection Integration:**",
      "• **Toggle Alliances** - Use 'Show/Hide Alliances' button to enable alliance selection features",
      "• **Quick Assignment** - Add teams directly to alliance positions from the Available Teams panel or pick lists",
      "• **Alliance Table** - Manage 8 alliances with captain and pick positions, plus backup teams",
      "• **Smart Positioning** - Teams are automatically assigned to next available position (Captain → Pick 1 → Pick 2 → Pick 3)",
      "• **Conflict Prevention** - Teams are automatically removed from pick lists when assigned to alliances",
      "• **Confirm Alliances** - Lock in final alliance selections for use in match strategy",
      "",
      "**Data Management:**",
      "• **Export** - Download your pick lists as JSON files for backup or sharing with team members",
      "• **Import** - Upload previously exported pick lists with enhanced validation and error handling",
      "• **Data Persistence** - All lists and alliances are automatically saved to your device",
      "",
      "**Pro Tips:**",
      "- Create multiple specialized pick lists for different strategic needs",
      "- Use alliance selection during actual alliance selection process at competitions",
      "- Export pick lists before events as backup and for sharing with drive team",
      "- Import team data from TBA Data page first to populate the available teams",
      "- Sort teams by different metrics to identify specialists vs versatile robots",
      "- Use the search function to quickly locate specific teams during alliance selection"
    ]
  },
  "/json-transfer": {
    title: "JSON Data Transfer",
    useDialog: true,
    content: [
      "![JSON Transfer Demo](./assets/tutorials/json-transfer-demo.gif)",
      "Export your scouting data or import data from other devices.",
      "1. 'Download Scouting Data as JSON' - Exports all your data in JSON format for backup or sharing",
      "2. 'Download Scouting Data as CSV' - Creates a spreadsheet-compatible file for analysis in Excel, Google Sheets, etc.",
      "3. 'Upload JSON Data' - Import scouting data from other devices or restore from backup",
      "4. JSON files maintain full data structure while CSV is optimized for spreadsheet analysis",
      "5. Upload will overwrite your current local data, so export first if you want to keep it",
      "Pro tip: Use JSON for device--to-device transfers and CSV for data analysis in spreadsheet tools."
    ]
  },
  "/api-data": {
    title: "API Data Management",
    useDialog: true,
    content: [
      "Unified data management system integrating The Blue Alliance API and Nexus for FRC for comprehensive competition data import.",
      "",
      "**Getting Started:**",
      "1. **TBA API Key** - Get your API key from thebluealliance.com/account (required for TBA operations)",
      "2. **Nexus API Key** - Get your API key from frc.nexus/en/api (required for Nexus operations)",
      "2. **Event Selection** - Enter event key (e.g., '2024chcmp', '2024week0', '2024necmp') for the competition",
      "3. **Session Storage** - Choose 'Remember for session only' to keep credentials for convenience",
      "4. **Data Source Selection** - Choose between The Blue Alliance and Nexus for FRC based on your needs",
      "",
      "**The Blue Alliance Integration:**",
      "• **Match Schedule** - Import team lineups and qualification match schedules",
      "  - Loads all qualification matches with team assignments",
      "  - Populates team dropdowns in scouting forms and match strategy",
      "  - Enables match number validation during scouting",
      "",
      "• **Match Results** - Verify predictions against actual match outcomes",
      "  - Import completed match scores and winning alliances",
      "  - Used for validating scouting predictions and awarding stakes",
      "  - Shows red/blue alliance scores and match winners",
      "",
      "• **Event Teams** - Load complete team lists for pit scouting and analysis",
      "  - Downloads all teams participating in the event",
      "  - Creates local team database for pit assignments and pick lists",
      "  - View teams in organized grid layout with filtering options",
      "",
      "**FRC Nexus Integration:**",
      "• **Enhanced Pit Data** - Import pit data for pit addresses and pit maps for an enhanced pit scouting experience",
      "",
      "**Consolidated Data Management:**",
      "• **Unified Interface** - Single page for all external data import needs",
      "• **Smart Caching** - Reduces API calls and improves performance",
      "• **Data Validation** - Automatic verification and error handling",
      "• **Backup Integration** - Seamless export/import with QR and JSON systems",
      "",
      "**Best Practices:**",
      "- Event keys are found on TBA event pages (URL format: /event/EVENTKEY)",
      "- Import team data early in events for complete pit scouting coverage",
      "- Use match results data to validate and improve your scouting accuracy",
      "- Regular data refresh ensures you have latest competition information",
      "- Export imported data as backup before major competitions"
    ]
  },
  "/qr-data-transfer": {
    title: "QR Data Transfer Hub",
    useDialog: true,
    content: [
      "![QR Data Transfer Demo](./assets/tutorials/qr-scouting-demo.gif)",
      "Comprehensive QR code-based data transfer system for all types of scouting data exchange.",
      "",
      "**Consolidated QR Transfer Features:**",
      "• **Scouting Data Transfer** - Share match scouting data between devices",
      "• **Match Schedule Transfer** - Distribute event schedules across your team",
      "• **Pick List Transfer** - Share alliance selection lists and rankings",
      "• **All Data Types** - Unified interface for any data transfer needs",
      "",
      "**Generate Fountain Codes:**",
      "1. Select the type of data you want to share (scouting data, match schedules, etc.)",
      "2. Choose transfer speed - use slower speeds in poor lighting or for older devices",
      "3. Click 'Generate & Start Auto-Cycling' to begin the QR code sequence",
      "4. Keep the generating device steady and ensure good lighting conditions",
      "5. The QR codes will automatically cycle - let recipients scan at their own pace",
      "",
      "**Scan Fountain Codes:**",
      "1. Position your device camera to clearly see the QR codes being displayed",
      "2. The progress bar shows reconstruction status as you scan multiple codes",
      "3. Continue scanning until 100% completion is reached",
      "4. Use 'Reset Scanner' to clear progress and start over if needed",
      "5. Choose 'Continue to App' when finished or 'Scan More Data' for additional transfers",
      "",
      "**Fountain Code Technology:**",
      "• Breaks large datasets into smaller, manageable QR code segments",
      "• Redundant encoding ensures data integrity even with missed scans",
      "• Works completely offline - perfect when WiFi/internet isn't available",
      "• Automatic error correction and data validation",
      "",
      "**Best Practices:**",
      "- Scouting leads should use this to collect data from scouts throughout events perfect for collecting data in batches so you don't have to collect after every match",
      "- Transfer data to drive teams in the pit for real-time strategy updates",
      "- Share with other teams using Maneuver for collaborative scouting",
      "- Use good lighting and keep devices steady during transfer",
      "- Allow time for complete scanning - rushing can cause data corruption"
    ]
  },
  "/strategy-overview": {
    title: "Strategy Overview",
    useDialog: true,
    content: [
      "![Strategy Overview Demo](./assets/tutorials/strategy-overview-demo.gif)",
      "Comprehensive team performance analysis with advanced filtering and visualization tools.",
      "1. Use the 'Event Filter' to analyze specific competitions or view all data combined",
      "2. Change 'Aggregation Type' (Average, Median, Max, 75th percentile) to see different statistical views",
      "3. 'Chart Section' - Toggle between bar charts for single metrics or scatter plots for correlation analysis",
      "4. 'Column Settings' - Show/hide specific data columns or use quick presets (Essential, Auto, Teleop, etc.)",
      "5. 'Column Filters' - Set numeric filters (>, >=, <, <=, =, !=) to find teams meeting specific criteria",
      "6. 'Data Table' - Sort by any column, view aggregated statistics across all scouted matches",
      "7. Use scatter plots to find correlations between metrics (e.g., coral vs algae scoring)",
      "Perfect for alliance selection, identifying team strengths/weaknesses, and strategic planning."
    ]
  },
  "/clear-data": {
    title: "Clear Data",
    content: [
      "Manage and clear scouting data when needed.",
      "Use carefully as this action cannot be undone.",
      "Consider exporting important data before clearing.",
      "Useful for starting fresh at new competitions or clearing test data."
    ]
  },
  "/scout-management": {
    title: "Scout Management Dashboard",
    useDialog: true,
    content: [
      "Comprehensive dashboard for monitoring scout performance and managing scout statistics.",
      "1. **View Selector** - Toggle between three visualization modes:",
      "   - Bar Chart - Visual ranking of scouts by selected metric",
      "   - Line Chart - Track scout performance progression over time",
      "   - Table - Detailed statistics with medal rankings for top 3 scouts",
      "    \n<br>\n",
      "2. **Metric Selector** - Choose which performance metric to analyze:",
      "   - Stakes - Total stakes earned by the scout",
      "   - Total Predictions - Number of predictions made",
      "   - Correct Predictions - Number of accurate predictions", 
      "   - Accuracy % - Percentage of correct predictions",
      "   - Current Streak - Active prediction streak",
      "   - Best Streak - Longest streak achieved",
      "    \n<br>\n",
      "3. **Individual Scout Profile** - Select any scout to view detailed statistics and performance badges",
      "4. **Summary Statistics** - Overview cards showing total scouts, predictions, stakes, and average accuracy",
      "5. **Medal System** - Table view shows gold 🥇, silver 🥈, and bronze 🥉 rankings for top performers",
      "Perfect for tracking scout engagement, identifying top performers, and managing scout teams during competitions.",
      "Pro tip: Have disengaged scouts? Stakes are a great way to gamify scouting and encourage participation and further analysis of your data."
    ]
  },
  "/pit-assignments": {
    title: "Pit Assignments",
    useDialog: true,
    content: [
      "Organize and manage pit scouting assignments across your team members with comprehensive tracking and assignment tools.",
      "**Getting Started:**",
      "1. **Add Scouters** - Use the Scouter Management section to add team members who will conduct pit scouting",
      "2. **Import Team Data** - Teams must be imported from the TBA Data page before creating assignments",
      "3. **Event Information** - View current event details and team count (automatically loaded from TBA data)",
      "",
      "**Assignment Modes:**",
      "• **Block Assignment** - Automatically divides teams into consecutive blocks for each scouter",
      "  - Teams are sorted numerically and distributed evenly",
      "  - Each scouter gets a sequential block of teams (e.g., Teams 1-10, 11-20, etc.)",
      "  - Perfect for systematic coverage with minimal overlap at events with sequential pit locations",
      "",
      "• **Manual Assignment** - Click-to-assign individual teams to specific scouters",
      "  - Select a scouter from the colored buttons, then click team cards to assign",
      "  - Right-click team cards to remove assignments",
      "  - Must confirm assignments before scouters can mark teams as completed",
      "",
      "**Two View Modes:**",
      "• **Team Cards** - Visual grid layout with color-coded assignments",
      "  - Each team shows as a card with scouter color coding",
      "  - Easy to see assignment distribution at a glance",
      "  - Interactive assignment and completion tracking",
      "",
      "• **Table View** - Sortable table with search and filtering capabilities",
      "  - Sort by team number, assigned scouter, or completion status",
      "  - Search for specific teams or scouters",
      "  - Export assignments to CSV for external sharing",
      "",
      "**Progress Tracking:**",
      "• Visual progress bars show completion percentage",
      "• Color-coded scouter legend with assignment counts",
      "• Real-time updates as teams are marked complete",
      "• Clear indicators for unassigned teams",
      "",
      "**Pro Tips:**",
      "- Block assignments work best for large events with consistent coverage needs",
      "- Manual assignments are ideal when you need specific scouter-team pairings",
      "- Use the search function in table view to quickly find specific teams",
      "- Export data regularly to backup your assignment progress",
      "- Assignments persist until manually cleared, perfect for multi-day events",
      "- Import new event data from TBA Data page will replace the current event automatically"
    ]
  }
};

export const getPageHelp = (pathname: string): PageHelpConfig | null => {
  return PAGE_HELP_CONFIG[pathname] || null;
};

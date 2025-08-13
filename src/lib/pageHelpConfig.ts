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
    title: "Pick Lists",
    content: [
      "Create and manage team ranking lists for alliance selection.",
      "Sort teams by various performance metrics and capabilities.",
      "Consider both quantitative data and qualitative observations.",
      "Export pick lists to share with drive team and strategy leads."
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
  "/parse-data": {
    title: "JSON to CSV Compilation Tool",
    content: [
      "Compile and export all JSON scouting data for analysis.",
      "Generate CSV files for sharing with other scouting systems.",
      "Verify data completeness and accuracy before export.",
      "Use exported data for advanced analytics and strategy tools such as Excel, Google Sheets, Tableau, or Power BI."
    ]
  },
  "/match-data": {
    title: "Load Match Data",
    useDialog: true,
    content: [
      "![Match Data Demo](./assets/tutorials/match-data-demo.gif)",
      "Import match schedules and team lists for competitions.",
      "1. OR use The Blue Alliance API for live data:",
      "2. Get your TBA API key from thebluealliance.com/account",
      "3. Enter the event key (e.g., '2024chcmp' for 2024 Championship)",
      "4. Click 'Submit' to load qualification matches automatically",
      "5. Match data populates team dropdowns and validates match numbers",
    ]
  },
  "/scout-data-qr": {
    title: "QR Scouting Data Transfer",
    useDialog: true,
    content: [
      "![QR Scouting Demo](./assets/tutorials/qr-scouting-demo.gif)",
      "Transfer scouting data between devices using QR fountain codes.",
      "'Generate Fountain Codes' - Convert your scouting data into multiple QR codes for others to scan",
      "1. Keep the default speed or select the slower speed and click 'Generate & Start Auto-Cycling'",
      "2. If the QR codes are not scanning properly, try adjusting the speed or lighting conditions.",
      "'Scan Fountain Codes' - Capture QR codes from another device to import data",
      "1. Scan a QR code and the progress bar shows reconstruction status as you scan.",
      "2. Resetting the scanner will clear the current progress and allow you to start over.",
      "3. Choose to Continue to App if done collecting data or Scan More Data",
      "Fountain codes break large data into smaller, manageable QR segments",
      "Scouting Leads should scan QR codes from scouts when needed to aggregate data.",
      "Data can then be passed back to scouter devices, to drive team in the pit, or to other teams using Maneuver.",
      "Perfect for transferring data when WiFi/internet isn't available."
    ]
  },
  "/match-data-qr": {
    title: "QR Match Data Transfer",
    useDialog: true,
    content: [
      "![QR Match Data Demo](./assets/tutorials/qr-match-data-demo.gif)",
      "Share match schedules between devices using QR fountain codes.",
      "'Generate Fountain Codes' - Convert your match data into multiple QR codes for others to scan",
      "1. Keep the default speed or select the slower speed and click 'Generate & Start Auto-Cycling'",
      "2. If the QR codes are not scanning properly, try adjusting the speed or lighting conditions.",
      "'Scan Fountain Codes' - Capture QR codes from another device to import data",
      "1. Scan a QR code and the progress bar shows reconstruction status as you scan.",
      "2. Resetting the scanner will clear the current progress and allow you to start over.",
      "3. Choose to Continue to App if done collecting data or Scan More Data",
      "Great for sharing event schedules across your scouting team",
      "Use this when you need to distribute match data without internet access."
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
  "/match-results": {
    title: "Match Results (TBA)",
    useDialog: true,
    content: [
      "Verify scouter predictions against official match results from The Blue Alliance API.",
      "**Setup Required:**",
      "1. Get an API key from [thebluealliance.com/account](https://www.thebluealliance.com/account)",
      "2. Replace 'YOUR_TBA_API_KEY_HERE' in src/lib/tbaUtils.ts with your actual key",
      "3. Restart the development server",
      "**Usage:**",
      "1. Enter an event key (e.g., '2024necmp' for 2024 NE Championship)",
      "2. Click 'Load Matches' to fetch qualification match results",
      "3. Select the matches you want to process for prediction verification",
      "4. Click 'Process Selected' to verify predictions and award points",
      "**Stakes System:**",
      "• 10 stakes for each correct prediction",
      "• Streak bonuses: 2 extra stakes for 2 in a row, 4 for 3 in a row, 6 for 4 in a row, etc.",
      "• Streaks reset when a prediction is incorrect or when there's a gap in sequential matches",
      "• Sequential matches: Must be within 3 matches of the previous prediction to maintain streak",
      "This feature automatically checks stored predictions against official results and awards stakes for correct predictions with exciting streak bonuses!"
    ]
  }
};

export const getPageHelp = (pathname: string): PageHelpConfig | null => {
  return PAGE_HELP_CONFIG[pathname] || null;
};

# Maneuver - Advanced FRC Scouting Application

A comprehensive scouting application for FIRST Robotics Competition (FRC) teams, built with React, TypeScript, and Vite. Maneuver provides powerful tools for match scouting, team analysis, and data management.

## 🚀 Features

### 📊 Match Scouting
- **Comprehensive Match Data Collection**: Track autonomous, teleop, and endgame performance
- **Visual Field Interface**: Interactive field maps for starting positions and game piece tracking
- **Real-time Input**: Live match scouting with intuitive controls
- **Match Strategy Integration**: Import match data from The Blue Alliance API

### 🔍 Team Analysis
- **Team Statistics Dashboard**: Detailed performance metrics and trends
- **Comparison Tools**: Side-by-side team comparisons with visual indicators
- **Starting Position Analysis**: Visual field maps showing position preferences and success rates
- **Performance Tracking**: Auto points, teleop points, climb rates, and reliability metrics

### 📱 Data Management
- **Multiple Import/Export Options**:
  - JSON file upload/download
  - QR code generation and scanning
  - Fountain code transfer for large datasets
- **Data Persistence**: Local storage with merge/overwrite capabilities
- **Demo Data**: Built-in sample data for testing and demonstrations

### 🎯 Game-Specific Features (2025 Season)
- **Coral Scoring**: Track coral placement across all 4 levels
- **Algae Management**: Net shots and processor scoring
- **Climb Analysis**: Shallow/deep climb attempts and success rates
- **Starting Position Mapping**: Visual field representation with performance analytics

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Data Transfer**: Luby Transform fountain codes for robust QR transfers
- **PWA Support**: Service worker integration for offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShinyShips/maneuver.git
   cd maneuver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📖 Usage

### Quick Start with Demo Data
1. Open the application
2. Click "Load Demo Data" on the homepage
3. Navigate to different sections to explore features
4. Use "Team Stats" to analyze team performance
5. Try "Data Transfer" to see QR code functionality

### Match Scouting Workflow
1. **Game Start**: Select match number and team
2. **Auto Phase**: Track starting position and autonomous actions
3. **Teleop Phase**: Record game piece scoring and field actions
4. **Endgame**: Document climb attempts and final status
5. **Submit**: Save match data to local storage

### Team Analysis
1. **Select Team**: Choose from available teams in your dataset
2. **View Statistics**: Analyze performance across multiple tabs
3. **Compare Teams**: Use the comparison dropdown for side-by-side analysis
4. **Position Analysis**: Study starting position preferences and success rates

### Data Management
- **Import**: Upload JSON files or scan QR codes
- **Export**: Download data or generate QR codes for sharing
- **Merge**: Combine datasets from multiple scouts
- **Fountain Codes**: Transfer large datasets reliably via QR codes

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AutoComponents/     # Autonomous phase components
│   ├── DashboardComponents/ # Main dashboard elements
│   ├── DataTransferComponents/ # Import/export functionality
│   ├── TeamStatsComponents/ # Team analysis tools
│   └── ui/                # Base UI components (shadcn/ui)
├── pages/              # Application pages/routes
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── assets/             # Images and static files
└── layouts/            # Page layout components
```

## 🔧 Key Components

### Data Models
- **Match Data**: Comprehensive match performance tracking
- **Team Statistics**: Calculated metrics and performance indicators
- **Starting Positions**: Field position analysis and visualization

### Transfer Systems
- **JSON Import/Export**: Standard data file handling
- **QR Code Generation**: Quick data sharing via QR codes
- **Fountain Codes**: Error-resilient transfer for large datasets using Luby Transform

### Analysis Tools
- **Team Comparison**: Side-by-side performance analysis
- **Position Mapping**: Visual field representation with statistics
- **Performance Trends**: Historical data analysis and visualization

## 🤝 Contributing

We welcome contributions to Maneuver! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the existing code style and patterns
4. **Test thoroughly**: Ensure all features work as expected
5. **Submit a pull request**: Describe your changes and their benefits

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Maintain responsive design for mobile compatibility
- Test data transfer features thoroughly
- Document any new features or changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FIRST Robotics Competition** for inspiring this project
- **VihaanChhabria** and the [VScouter project](https://github.com/VihaanChhabria/VScouter) for providing the initial foundation and inspiration for this application
- **The Blue Alliance** for providing match data APIs
- **shadcn/ui** for the excellent component library
- **Luby Transform** library for robust data transfer capabilities

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Check the documentation and demo data for examples

---

**Built with ❤️ for the FRC community**

*Maneuver helps teams make data-driven decisions and improve their competitive performance through comprehensive scouting and analysis tools.*

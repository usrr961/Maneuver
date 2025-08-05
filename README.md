# Maneuver - Advanced FRC Scouting Application

A comprehensive scouting application for FIRST Robotics Competition (FRC) teams, built with React, TypeScript, and Vite. Maneuver provides powerful tools for match scouting, team analysis, and data management.

## 🚀 Features

### 📊 Match Scouting
- **Comprehensive Data Collection**: Track autonomous, teleop, and endgame performance with real-time input
- **Interactive Field Maps**: Visual interfaces for starting positions
- **2025 Game Support**: Coral scoring (4 levels), algae management, and climb analysis
- **Match Strategy Integration**: Import match data from The Blue Alliance API

### 🔍 Team Analysis & Strategy
- **Multi-Tab Dashboard**: Detailed performance metrics across Overall, Auto, Teleop, and Endgame phases
- **Advanced Analytics**: Strategy overview with filtering, sorting, charts, and multiple aggregation types
- **Team Comparisons**: Side-by-side analysis with visual indicators and statistical significance
- **Position Analysis**: Field maps showing starting position preferences and success rates
- **Alliance Selection**: Drag-and-drop pick lists with embedded team statistics

### 📱 Data Management
- **Flexible Transfer**: JSON files and fountain codes for large datasets
- **Local Storage**: Persistent data with merge/overwrite capabilities
- **Demo Integration**: Built-in sample data

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Data Transfer**: Luby Transform fountain codes for robust QR transfers
- **PWA Support**: Service worker integration for offline functionality
- **Analytics**: Google Analytics 4 integration for usage tracking

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

### Quick Start
1. **Demo Data**: Click "Load Demo Data" on homepage to explore all features
2. **Core Workflows**: Match scouting → Team analysis → Strategy planning → Alliance selection
3. **Data Transfer**: Use QR codes or JSON files to share data between devices

### Key Workflows

**Match Scouting**: Game Start → Auto Phase → Teleop → Endgame → Submit
**Team Analysis**: Select team → View multi-tab statistics → Compare with others → Analyze positions
**Strategy Planning**: Dashboard overview → Interactive charts → Column configuration → Event filtering
**Alliance Selection**: Create pick lists → Research teams → Drag-and-drop ordering → Export/share

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AutoComponents/     # Autonomous phase components
│   ├── DashboardComponents/ # Main dashboard elements
│   ├── DataTransferComponents/ # Import/export functionality
│   ├── TeamStatsComponents/ # Team analysis tools
│   ├── StrategyComponents/ # Strategy overview and analysis
│   ├── PickListComponents/ # Alliance selection tools
│   ├── MatchStrategyComponents/ # Match planning tools
│   └── ui/                # Base UI components (shadcn/ui)
├── pages/              # Application pages/routes
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── assets/             # Images and static files
└── layouts/            # Page layout components
```

## 🔧 Architecture

### Core Components
- **Match Data Models**: Performance tracking with statistical analysis
- **Mobile-First UI**: Touch-friendly responsive design with interactive charts
- **Data Transfer**: JSON, QR codes, and fountain codes with error resilience
- **Modular Design**: Reusable components for maintainable development

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

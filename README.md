# NYC Dog Runs & Skate Parks Skating Directions

A modern full-stack React application that provides skating directions between any NYC dog run and skate park using NYC Open Data and OpenRouteService.

## Features

- 🗺️ **Interactive Map**: View all NYC dog runs and skate parks on a single map
- 🐕🛹 **Combined Location Selection**: Select any location (dog run or skate park) as start or destination
- 🏷️ **Chip-based Selection**: Start and destination are shown as chips, easily cleared
- 🖱️ **Click-to-Select**: Click a marker on the map or a location in the list to set start/destination
- 🔍 **Search**: Filter locations by name
- 🚦 **Directions**: Get step-by-step skating directions between any two locations
- 🐕 **Animated Skatecorg**: Watch a cute animated corgi skate along the route
- 📱 **Mobile Friendly**: Responsive layout for mobile and desktop
- ⚡ **Fast**: Data is cached and optimized for performance

## Tech Stack

- **Frontend**: React 18, Material-UI, React-Leaflet, OpenStreetMap tiles
- **Backend**: Node.js, Express, Axios, OpenRouteService API
- **Data**: NYC Open Data (dog runs & skate parks), OpenRouteService for routing

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouteService API key (free at https://openrouteservice.org/sign-up/)

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Set up Environment Variables

Create a `.env` file in the `server/` directory:

```
ORS_API_KEY=your_actual_ors_key_here
```

### 3. Start the Application

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## How to Use

1. **Select Start & Destination**: Click a location in the list or on the map. The first click sets the start, the second sets the destination. Chips show your selections and can be cleared.
2. **Get Directions**: Click "Get Skating Directions" to see the route and step-by-step instructions.
3. **Map Interaction**: Click any marker to select it as start/destination.
4. **Animated Route**: Watch the skatecorg animation move along the route when directions are set.
5. **Search**: Use the search box to filter locations by name.
6. **Mobile**: The app is fully responsive and works great on phones.

## Project Structure

```
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   │   ├── MapComponent.js
│   │   │   ├── LocationSelector.js
│   │   │   └── DirectionsPanel.js
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js           # Express server
│   └── package.json
├── package.json           # Root package.json
├── .env                   # Environment variables (in server/)
└── README.md
```

## Main Features

- **Combined Location List**: All dog runs and skate parks are shown in a single, searchable list.
- **Chip-based Selection**: Start and destination are shown as chips with icons and can be cleared.
- **Map Click Selection**: Click any marker to set as start/destination.
- **No Address/Boroughs**: Only the name of each location is shown for clarity.
- **Mobile Responsive**: Map and controls adapt to mobile screens.
- **Step-by-step Directions**: Clear instructions and route visualization.

## Data Sources

- **Dog Runs**: https://opendata.cityofnewyork.us/
- **Skate Parks**: https://opendata.cityofnewyork.us/
- **Routing**: https://openrouteservice.org/

## Environment Variables

- `ORS_API_KEY` (required, in `server/.env`): Your OpenRouteService API key
- `DOG_RUNS_API_URL` (required, in `server/.env`): NYC Open Data key
- `SKATE_PARKS_API_URL` (required, in `server/.env`): NYC Open Data key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

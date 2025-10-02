# Anand Saathi System Architecture Diagram
## Complete Workflow: Frontend + Backend

```mermaid
graph TB
    %% Frontend Layer
    subgraph "🌐 Frontend (React/TypeScript)"
        Farmer[👨‍🌾 Farmer/User]
        React[⚛️ React App<br/>Vite + TypeScript]
        UI[🎨 UI Components<br/>shadcn/ui + Tailwind]
        State[📊 Global State<br/>Context API + Reducers]

        Farmer --> React
        React --> UI
        React --> State

        %% Feature Modules
        subgraph "🔧 Feature Modules"
            FM[🌾 Field Management]
            IoT[📡 IoT Dashboard]
            AI[🤖 AI Forecasting]
            Veg[🛰️ Vegetation Analysis]
            Gov[🏛️ Government Integration]
            Market[💰 Market Analysis]
            Sensors[📱 Sensor Management]
        end

        State --> FM
        State --> IoT
        State --> AI
        State --> Veg
        State --> Gov
        State --> Market
        State --> Sensors
    end

    %% Real-time Communication
    subgraph "⚡ Real-time Communication"
        WS_Client[🔌 Socket.io Client]
        WS_Server[🌐 WebSocket Server<br/>Node.js + Express]
        LiveData[📈 Live Data Stream]
    end

    React --> WS_Client
    WS_Client <-->> WS_Server
    WS_Server --> LiveData

    %% Backend Services
    subgraph "🖥️ Backend Services"
        Supabase_DB[(🗄️ PostgreSQL<br/>Supabase)]
        EdgeFunc[⚙️ Edge Functions<br/>Supabase Functions]
        Auth[🔐 Authentication<br/>Supabase Auth]
    end

    WS_Server --> Supabase_DB
    EdgeFunc --> Supabase_DB
    Auth --> Supabase_DB

    %% External Integrations
    subgraph "🔗 External APIs"
        GEE[🛰️ Google Earth Engine<br/>Satellite Imagery]
        TimesFM[🤖 TimesFM<br/>AI Forecasting]
        GovAPI[🏛️ Government APIs<br/>Farmer Verification]
        WeatherAPI[🌤️ Weather APIs<br/>Real-time Data]
        MarketAPI[📊 Market Data APIs<br/>Price Intelligence]
    end

    %% Data Flow Connections
    %% Frontend to Backend
    FM --> Supabase_DB
    IoT --> WS_Server
    AI --> TimesFM
    Veg --> GEE
    Gov --> GovAPI
    Sensors --> Supabase_DB

    %% Backend Processing
    EdgeFunc --> GEE
    EdgeFunc --> TimesFM
    EdgeFunc --> GovAPI
    EdgeFunc --> WeatherAPI
    EdgeFunc --> MarketAPI

    %% Real-time Data Broadcasting
    LiveData --> WS_Client
    WS_Client --> State

    %% Data Storage Flow
    GEE --> Supabase_DB
    TimesFM --> Supabase_DB
    GovAPI --> Supabase_DB
    WeatherAPI --> Supabase_DB
    MarketAPI --> Supabase_DB

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef external fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef realtime fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class Farmer,React,UI,State,FM,IoT,AI,Veg,Gov,Market,Sensors,WS_Client frontend
    class WS_Server,LiveData,Supabase_DB,EdgeFunc,Auth backend
    class GEE,TimesFM,GovAPI,WeatherAPI,MarketAPI external
    class WS_Server,LiveData realtime
```

## 📋 System Components Overview

### Frontend Layer
- **React Application**: Modern React app with TypeScript and Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: Context API with useReducer for global state
- **Feature Modules**: Specialized modules for different agricultural functions

### Backend Services
- **WebSocket Server**: Real-time data streaming server (Node.js + Socket.io)
- **Supabase Database**: PostgreSQL database with authentication
- **Edge Functions**: Serverless functions for external API integrations

### External Integrations
- **Google Earth Engine**: Satellite imagery and vegetation analysis
- **TimesFM**: AI-powered forecasting models
- **Government APIs**: Farmer verification and subsidy tracking
- **Weather/Market APIs**: Real-time environmental and market data

## 🔄 Data Flow Patterns

1. **Real-time Monitoring**:
   ```
   Sensors → WebSocket Server → React Components → UI Updates
   ```

2. **AI Forecasting**:
   ```
   Field Data → Edge Functions → TimesFM API → Predictions → Database
   ```

3. **Satellite Analysis**:
   ```
   Field Boundaries → GEE API → Vegetation Indices → Health Status → Storage
   ```

4. **Government Integration**:
   ```
   Farmer Records → Gov APIs → Verification → Digital Records → Benefits
   ```

## 🚀 Deployment Architecture

- **Frontend**: Netlify/Vercel for static hosting
- **Backend**: Supabase for database and serverless functions
- **WebSocket**: Standalone Node.js server for real-time features
- **External APIs**: Direct integrations with specialized services

---
*This diagram represents the complete Anand Saathi agricultural technology platform architecture.*

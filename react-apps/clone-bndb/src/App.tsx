import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import PropertyGrid from './components/PropertyGrid';
import { PropertyDetails } from './components/PropertyDetails';
import { PropertyMap } from './components/Map';

function App() {
  const [showMap, setShowMap] = React.useState(false);

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route
            path="/"
            element={
              <main className="relative flex-1">
                <button
                  className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-full font-semibold md:bottom-8"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? 'Show list' : 'Show map'}
                </button>
                {showMap ? (
                  <div className="h-[calc(100vh-160px)]">
                    <PropertyMap />
                  </div>
                ) : (
                  <PropertyGrid />
                )}
              </main>
            }
          />
          <Route path="/property/:id" element={<PropertyDetails />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
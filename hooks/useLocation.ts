import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const updateLocation = async () => {
    try {
      const newLocation = await Location.getCurrentPositionAsync({});
      setLocation(newLocation);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  return { location, errorMsg, updateLocation };
}
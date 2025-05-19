
import { useState, useEffect } from 'react';
import { TrackSheet } from '@/types';

// Custom hook to manage track sheets state
export function useTrackSheetState() {
  const [trackSheets, setTrackSheets] = useState<TrackSheet[]>(() => {
    const saved = localStorage.getItem("trackSheets");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("trackSheets", JSON.stringify(trackSheets));
  }, [trackSheets]);

  const addTrackSheet = (trackSheet: Omit<TrackSheet, "id">) => {
    const newTrackSheet = {
      ...trackSheet,
      id: `ts${Date.now()}`
    };
    setTrackSheets([...trackSheets, newTrackSheet]);
  };

  const updateTrackSheet = (id: string, trackSheetData: Partial<TrackSheet>) => {
    setTrackSheets(
      trackSheets.map((sheet) =>
        sheet.id === id ? { ...sheet, ...trackSheetData } : sheet
      )
    );
  };

  const deleteTrackSheet = (id: string) => {
    setTrackSheets(trackSheets.filter((sheet) => sheet.id !== id));
  };

  return {
    trackSheets,
    addTrackSheet,
    updateTrackSheet,
    deleteTrackSheet
  };
}

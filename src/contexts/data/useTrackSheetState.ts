
import { useState, useEffect } from 'react';
import { TrackSheet, TrackSheetRow } from '@/types';
import { format } from 'date-fns';

// Custom hook to manage track sheets state
export function useTrackSheetState() {
  const [trackSheets, setTrackSheets] = useState<TrackSheet[]>(() => {
    const saved = localStorage.getItem("trackSheets");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Store track sheet templates
  const [trackSheetTemplates, setTrackSheetTemplates] = useState<TrackSheet[]>(() => {
    const saved = localStorage.getItem("trackSheetTemplates");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("trackSheets", JSON.stringify(trackSheets));
  }, [trackSheets]);
  
  useEffect(() => {
    localStorage.setItem("trackSheetTemplates", JSON.stringify(trackSheetTemplates));
  }, [trackSheetTemplates]);

  const addTrackSheet = (trackSheet: Omit<TrackSheet, "id">) => {
    const newTrackSheet = {
      ...trackSheet,
      id: `ts${Date.now()}`
    };
    setTrackSheets([...trackSheets, newTrackSheet]);
    return newTrackSheet;
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
  
  // Save a track sheet as a template
  const saveTrackSheetTemplate = (template: Omit<TrackSheet, "id">) => {
    const newTemplate = {
      ...template,
      id: `tst${Date.now()}`,
      savedAt: format(new Date(), 'yyyy-MM-dd')
    };
    setTrackSheetTemplates([...trackSheetTemplates, newTemplate]);
    return newTemplate;
  };
  
  // Update a saved template
  const updateTrackSheetTemplate = (id: string, templateData: Partial<TrackSheet>) => {
    setTrackSheetTemplates(
      trackSheetTemplates.map((template) =>
        template.id === id ? { ...template, ...templateData } : template
      )
    );
  };
  
  // Delete a saved template
  const deleteTrackSheetTemplate = (id: string) => {
    setTrackSheetTemplates(trackSheetTemplates.filter((template) => template.id !== id));
  };
  
  // Get track sheets by date
  const getTrackSheetsByDate = (date: string) => {
    return trackSheets.filter(sheet => sheet.date === date);
  };
  
  // Get track sheets by vehicle
  const getTrackSheetsByVehicle = (vehicleId: string) => {
    return trackSheets.filter(sheet => sheet.vehicleId === vehicleId);
  };
  
  // Get track sheets by salesman
  const getTrackSheetsBySalesman = (salesmanId: string) => {
    return trackSheets.filter(sheet => sheet.salesmanId === salesmanId);
  };

  return {
    trackSheets,
    trackSheetTemplates,
    addTrackSheet,
    updateTrackSheet,
    deleteTrackSheet,
    saveTrackSheetTemplate,
    updateTrackSheetTemplate,
    deleteTrackSheetTemplate,
    getTrackSheetsByDate,
    getTrackSheetsByVehicle,
    getTrackSheetsBySalesman
  };
}

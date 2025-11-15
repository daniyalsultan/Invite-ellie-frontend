import { useState, useEffect } from 'react';
import { apiService, Meeting, Transcript, AINote } from '../services/api';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMeetings();
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meetings');
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  return { meetings, loading, error, refresh: loadMeetings };
}

export function useMeeting(id: string | null) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMeeting(id);
      setMeeting(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meeting');
      console.error('Error loading meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  return { meeting, loading, error, refresh: loadMeeting };
}

export function useTranscripts(meetingId: string | null) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setLoading(false);
      return;
    }
    loadTranscripts();
  }, [meetingId]);

  const loadTranscripts = async () => {
    if (!meetingId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTranscripts(meetingId);
      setTranscripts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcripts');
      console.error('Error loading transcripts:', err);
    } finally {
      setLoading(false);
    }
  };

  return { transcripts, loading, error, refresh: loadTranscripts };
}

export function useAINotes(meetingId: string | null) {
  const [notes, setNotes] = useState<AINote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setLoading(false);
      return;
    }
    loadNotes();
  }, [meetingId]);

  const loadNotes = async () => {
    if (!meetingId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAINotes(meetingId);
      setNotes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI notes');
      console.error('Error loading AI notes:', err);
    } finally {
      setLoading(false);
    }
  };

  return { notes, loading, error, refresh: loadNotes };
}


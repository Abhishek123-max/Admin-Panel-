import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getSessionId(): string {
  let sid = sessionStorage.getItem('_wp_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2);
    sessionStorage.setItem('_wp_sid', sid);
  }
  return sid;
}

export function usePageTracker() {
  const location = useLocation();

  useEffect(() => {
    supabase.from('page_views').insert({
      path: location.pathname + (location.search || ''),
      referrer: document.referrer || '',
      user_agent: navigator.userAgent || '',
      session_id: getSessionId(),
    }).then(() => {});
  }, [location.pathname, location.search]);
}

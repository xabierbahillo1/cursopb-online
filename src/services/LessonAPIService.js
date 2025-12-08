import { CONFIG } from './LessonService';

export async function fetchLesson(lessonId) {
  // Fetch de lección desde API externa. Modo API
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${CONFIG.apiBaseUrl}/api/lessons/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (response.status === 403) {
      return { data: null, isLocked: true, error: null };
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.isLocked) {
      return { data: null, isLocked: true, error: null };
    }
    console.log({ data, isLocked: false, error: null })
    return { data, isLocked: false, error: null };

  } catch (err) {
    console.error(`Error fetching lesson ${lessonId}:`, err);
    return { data: null, isLocked: false, error: err.message };
  }
}

export async function checkAccess() {
  // Verifica acceso del usuario mediante API externa. Modo API
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const response = await fetch(`${CONFIG.apiBaseUrl}/api/user/access`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.hasPaidAccess === true;

  } catch {
    return false;
  }
}
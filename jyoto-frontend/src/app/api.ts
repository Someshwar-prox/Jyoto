import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tutorAPI = {
  ask: (query: string, lang: string = 'en') =>
    api.post('/api/tutor/ask', { user_query: query, target_lang: lang }),
};

export const dashboardAPI = {
  processLesson: (title: string, text: string) =>
    api.post('/api/dashboard/process-lesson', { lesson_title: title, raw_lesson_text: text }),
};

export const bandwidthAPI = {
  generate: (topic: string, grade: string) =>
    api.post('/api/low-bandwidth/generate', { topic, grade_level: grade }),
};

export const coreAPI = {
  explain: (concept: string, lang: string) =>
    api.post('/api/explain', { concept, target_language: lang }),
  tts: (text: string, lang: string) =>
    `${API_BASE_URL}/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`,
};

export default api;

# **App Name**: Audentia

## Core Features:

- Landing Page: Visually appealing landing page with sections for hero, features, how it works, and a clear login/register call-to-action, designed with a mobile-first approach and responsiveness for desktop.
- User Authentication: Firebase Authentication integration (email + password) with auto-generation of a unique 6-digit numeric ID upon signup.
- User Dashboard: User dashboard displaying points balance and 6-digit ID with profile editing capabilities using a mobile-friendly card design.
- ESP32 Integration: Secure REST endpoint for ESP32 integration to update user points upon validation, ensuring data integrity and security.
- AI Motivational Messages: Display dynamically updated, Gemini AI-generated, eco-friendly messages on the user dashboard after point increases.
- Unique User ID: Automatic 6-digit numeric ID generation upon user registration, stored securely within their profile on Firestore.

## Style Guidelines:

- Primary color: Saturated green (#90EE90) to reflect eco-friendliness and positive impact.
- Background color: Light desaturated green (#F0FFF0).
- Accent color: Complementary light blue (#ADD8E6) for highlights and CTAs.
- Font: 'Inter', a sans-serif, for both headlines and body text, ensuring readability and a modern aesthetic.
- Use clear, modern icons that represent sustainability and rewards.
- Mobile-first layout with a focus on clear hierarchy and easy navigation, ensuring a seamless user experience on all devices.
- Subtle Framer Motion animations on button hover states, content transitions, and when points are updated, enhancing user engagement.
# ARIA Frontend

ARIA is a dark, responsive authentication frontend for the voice interface concept "Where Silence Finds Its Voice".

## Tech Stack

- React
- Vite
- CSS modules by convention through shared stylesheet files
- Local browser-history routing for Week 1 screens

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Project Structure

- `src/pages` contains Welcome, Login, SignUp, OTP verification, and Logout confirmation pages.
- `src/components/Common` contains reusable Button, Input, and Card components.
- `src/components/Auth` contains form components for login, signup, and OTP.
- `src/components/Backgrounds` contains animated page backgrounds.
- `src/styles` contains global styles, variables, form styles, responsive rules, and animations.
- `public/assets/aria_icon_both_animated.html` stores the original animated logo HTML.

## Notes

Tailwind and PostCSS config files are present for the planned setup. The current UI is implemented in plain CSS so it builds without extra packages.

## License

For project use.

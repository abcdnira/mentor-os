FROM node:20-alpine

WORKDIR /app

RUN cat > package.json <<'PKG'
{
  "scripts": {
    "start": "next start -H 0.0.0.0 -p 3000",
    "build": "next build"
  },
  "dependencies": {
    "next": "14.2.23",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
PKG

RUN mkdir -p app && cat > app/page.jsx <<'PAGE'
export default function Home() {
  return (
    <main style={{fontFamily: "Arial", padding: 40}}>
      <h1>Mentor OS</h1>
      <p>AI Mentor + Second Brain is running.</p>
    </main>
  );
}
PAGE

RUN cat > app/layout.jsx <<'LAYOUT'
export const metadata = {
  title: "Mentor OS",
  description: "AI Mentor + Second Brain"
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
LAYOUT

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "start"]

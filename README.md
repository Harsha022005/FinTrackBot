project:
  name: "💰 Expense Tracker Telegram Bot"
  description: >
    Track your expenses via Telegram using simple commands.
    Built with Node.js, Express, MongoDB, and deployed on Render.

tech_stack:
  backend: "Node.js, Express"
  database: "MongoDB Atlas (Mongoose)"
  integration: "Telegram Bot API"
  deployment: "Render"

bot:
  username: "@expensestrackerfinancebot"
  link: "https://t.me/expensestrackerfinancebot"

features:
  - "/start": "Welcome message and instructions"
  - "/addexpenses <amount> <category>": "Add an expense"
  - "/todayexpenses": "View today’s expenses"
  - "/weekly": "View weekly expenses"
  - "/monthly": "View monthly expenses"

env:
  - BOT_TOKEN
  - MONGODB_URI
  - WEBHOOK_URL

usage:
  - "/addexpenses 200 Transport"
  - "/todayexpenses"
  - "/weekly"
  - "/monthly"
  - "/history"
    


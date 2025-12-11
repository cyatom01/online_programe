export enum MessageRole {
  User = 'user',
  Model = 'model',
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  isStreaming?: boolean;
}

export interface TabOption {
  id: 'code' | 'preview';
  label: string;
  icon: string;
}

export const INITIAL_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { margin-bottom: 0.5rem; }
        p { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Code Studio</h1>
        <p>Ask the AI on the left to change this page!</p>
    </div>
</body>
</html>`;
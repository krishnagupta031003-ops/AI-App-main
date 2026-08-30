/**
 * Dummy chat conversations and messages data
 */

export const dummyConversations = [
  {
    id: 'conv-1',
    title: 'Introduction to React Hooks',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Can you explain what React hooks are and why they were introduced?',
        timestamp: '2026-07-04T08:00:00.000Z',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 to solve several problems:

1. **Code Reusability**: Before hooks, sharing stateful logic between components required complex patterns like Higher-Order Components or Render Props. Hooks allow you to extract and reuse stateful logic without changing component hierarchy.

2. **Simplicity**: Class components had confusing lifecycle methods and "this" binding issues. Hooks let you write components as simple functions while still having access to state and lifecycle features.

3. **Better Organization**: Related logic that was previously split across lifecycle methods can now be grouped together with hooks like useEffect.

The most common hooks are:
- \`useState\`: For adding state to functional components
- \`useEffect\`: For side effects (like data fetching, subscriptions)
- \`useContext\`: For consuming context values
- \`useCallback\` and \`useMemo\`: For performance optimization

Would you like me to show you some practical examples?`,
        timestamp: '2026-07-04T08:00:15.000Z',
      },
      {
        id: 'msg-3',
        role: 'user',
        content: 'Yes, please show me a useState example',
        timestamp: '2026-07-04T08:01:00.000Z',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `Here's a simple counter example using useState:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  // useState returns [currentState, setterFunction]
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
\`\`\`

Key points:
- \`useState(0)\` initializes count to 0
- \`count\` is the current state value
- \`setCount\` is the function to update the state
- When you call setCount, React re-renders the component with the new value`,
        timestamp: '2026-07-04T08:01:20.000Z',
      },
    ],
    createdAt: '2026-07-04T08:00:00.000Z',
    updatedAt: '2026-07-04T08:01:20.000Z',
  },
  {
    id: 'conv-2',
    title: 'Building a REST API with Express',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'How do I create a simple REST API with Express.js?',
        timestamp: '2026-07-03T14:30:00.000Z',
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `I'll help you create a simple REST API with Express.js. Here's a basic setup:

\`\`\`javascript
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Sample data
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// GET all users
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET single user
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// POST create user
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  res.json({ success: true, data: user });
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

  users.splice(index, 1);
  res.json({ success: true, message: 'User deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

This creates a basic CRUD API with all standard REST operations!`,
        timestamp: '2026-07-03T14:30:45.000Z',
      },
    ],
    createdAt: '2026-07-03T14:30:00.000Z',
    updatedAt: '2026-07-03T14:30:45.000Z',
  },
  {
    id: 'conv-3',
    title: 'CSS Grid vs Flexbox',
    messages: [
      {
        id: 'msg-7',
        role: 'user',
        content: 'When should I use CSS Grid vs Flexbox?',
        timestamp: '2026-07-02T10:15:00.000Z',
      },
      {
        id: 'msg-8',
        role: 'assistant',
        content: `Great question! Both are powerful layout tools, but they excel in different scenarios:

**Use Flexbox when:**
- Creating 1-dimensional layouts (rows OR columns)
- Distributing space along a single axis
- Aligning items within a container
- Building navigation bars, card layouts, or centering content
- You need content-based sizing (items dictate layout)

**Use CSS Grid when:**
- Creating 2-dimensional layouts (rows AND columns)
- You need precise control over both axes simultaneously
- Building complex page layouts (headers, sidebars, main content, footers)
- Creating responsive grids with explicit placement
- You need layout-based sizing (layout dictates item sizes)

**Pro tip**: You can use them together! Grid for the overall page layout, Flexbox for component internals.

Would you like to see examples of each?`,
        timestamp: '2026-07-02T10:15:30.000Z',
      },
    ],
    createdAt: '2026-07-02T10:15:00.000Z',
    updatedAt: '2026-07-02T10:15:30.000Z',
  },
  {
    id: 'conv-4',
    title: 'Python List Comprehensions',
    messages: [
      {
        id: 'msg-9',
        role: 'user',
        content: 'What are list comprehensions in Python and how do I use them?',
        timestamp: '2026-07-01T16:45:00.000Z',
      },
      {
        id: 'msg-10',
        role: 'assistant',
        content: `List comprehensions are a concise way to create lists in Python. They're more readable and often faster than traditional loops.

**Basic syntax:**
\`\`\`python
[expression for item in iterable if condition]
\`\`\`

**Examples:**

1. **Square numbers:**
\`\`\`python
# Traditional way
squares = []
for x in range(10):
    squares.append(x**2)

# List comprehension
squares = [x**2 for x in range(10)]
# Result: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
\`\`\`

2. **Filter even numbers:**
\`\`\`python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]
# Result: [2, 4, 6, 8, 10]
\`\`\`

3. **Transform strings:**
\`\`\`python
words = ['hello', 'world', 'python']
upper_words = [word.upper() for word in words]
# Result: ['HELLO', 'WORLD', 'PYTHON']
\`\`\`

4. **Nested comprehension:**
\`\`\`python
matrix = [[i*j for j in range(1, 4)] for i in range(1, 4)]
# Result: [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
\`\`\`

They make your code more Pythonic and easier to read once you're familiar with them!`,
        timestamp: '2026-07-01T16:45:40.000Z',
      },
    ],
    createdAt: '2026-07-01T16:45:00.000Z',
    updatedAt: '2026-07-01T16:45:40.000Z',
  },
  {
    id: 'conv-5',
    title: 'Welcome to AI Chat',
    messages: [
      {
        id: 'msg-11',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you with coding, writing, research, and much more. What would you like to work on today?',
        timestamp: '2026-06-30T09:00:00.000Z',
      },
    ],
    createdAt: '2026-06-30T09:00:00.000Z',
    updatedAt: '2026-06-30T09:00:00.000Z',
  },
];

// Helper function to get a conversation by ID
export function getConversationById(id) {
  return dummyConversations.find(conv => conv.id === id);
}

// Helper function to get recent conversations (sorted by updatedAt)
export function getRecentConversations(limit = 10) {
  return [...dummyConversations]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);
}

// File: server.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { gql } = require('apollo-server-express');
const cors = require('cors');

// In-memory data store
let todos = [
  { id: '1', task: 'Learn GraphQL', completed: false, priority: 'high' },
  { id: '2', task: 'Build a Todo App', completed: false, priority: 'medium' },
  { id: '3', task: 'Exercise', completed: true, priority: 'low' }
];

// GraphQL Schema Definition
const typeDefs = gql`
  enum Priority {
    high
    medium
    low
  }

  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: Priority!
  }

  type Query {
    getTodos(completed: Boolean, priority: Priority): [Todo]!
    getTodo(id: ID!): Todo
  }

  type Mutation {
    addTodo(task: String!, priority: Priority!): Todo!
    deleteTodo(id: ID!): Boolean!
    toggleTodo(id: ID!): Todo
    updateTodoPriority(id: ID!, priority: Priority!): Todo
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getTodos: (_, { completed, priority }) => {
      let filteredTodos = [...todos];
      
      if (completed !== undefined) {
        filteredTodos = filteredTodos.filter(todo => todo.completed === completed);
      }
      
      if (priority) {
        filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
      }
      
      return filteredTodos;
    },
    getTodo: (_, { id }) => {
      return todos.find(todo => todo.id === id);
    }
  },
  Mutation: {
    addTodo: (_, { task, priority }) => {
      const newTodo = {
        id: String(Date.now()),
        task,
        completed: false,
        priority
      };
      todos.push(newTodo);
      return newTodo;
    },
    deleteTodo: (_, { id }) => {
      const initialLength = todos.length;
      todos = todos.filter(todo => todo.id !== id);
      return todos.length !== initialLength;
    },
    toggleTodo: (_, { id }) => {
      const todo = todos.find(todo => todo.id === id);
      if (!todo) return null;
      
      todo.completed = !todo.completed;
      return todo;
    },
    updateTodoPriority: (_, { id, priority }) => {
      const todo = todos.find(todo => todo.id === id);
      if (!todo) return null;
      
      todo.priority = priority;
      return todo;
    }
  }
};

async function startServer() {
  const app = express();
  app.use(cors());
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true
  });
  
  await server.start();
  server.applyMiddleware({ app });
  
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
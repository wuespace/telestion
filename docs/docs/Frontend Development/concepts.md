---
 tags:
   - Frontend Development
---

# Concepts

This document describes the various concepts you need to know when building components for the Telestion frontend.

## Overview

You can find the most important concepts of the Telestion frontend as well as how they relate to each other in the following diagram:

  ```mermaid
  graph BT
    frontend[Telestion Frontend] -->|is written in|react[React]
    react -->|uses the programming language|ts[TypeScript]
    user[User] -->|uses|frontend
    subgraph frontend[Telestion Frontend]
      dashboard[Dashboard]
      widgetInstance[Widget Instances]
      widget[Widgets]
    end
    dashboard[Dashboard] -->|is a layout of|widgetInstance[Widget Instances]
    widget -->|defines the look and behavior of|widgetInstance[Widget Instances]
    click widgetInstance "#widget-instances" "Widget Instance"
    click widget "#widget" "Widget"
    click dashboard "#dashboard" "Dashboard"
    click react "#react" "React"
    click ts "#typescript" "TypeScript"
  ```

You can click on the elements in the diagram to learn more about them.

## Frontend

The Telestion frontend is the part of Telestion that is visible to the user. It is built with React and TypeScript. It is responsible for displaying data from the backend and for sending commands to the backend.

## Dashboard

A dashboard is a layout of [widget instances](#widget-instances) with a specific configuration, created by the user. They are the main part of the Telestion frontend.

## Widget Instances

A widget instance is an instance of a widget with a specific configuration. They are the building blocks of [dashboards](#dashboard).

## Widget

A widget is the type of a widget instance. It contains the code that defines how the widget instance looks like and how it behaves.

## HTML/CSS/JavaScript

HTML, CSS, and JavaScript are the three core technologies of the web. HTML is used to describe the structure of web pages. CSS is used to describe the presentation of web pages. JavaScript is used to describe the behavior of web pages.

## React

The Telestion frontend is built with [React](https://reactjs.org/). React is a JavaScript library for building user interfaces. It is component-based and declarative. This means that you can build your UI from small, reusable components and that you can describe how your UI should look like without having to worry about how it is rendered.

### Components

Components are the building blocks of React applications. They are small, reusable pieces of code that can be composed to build more complex components. Components can be either functional or class-based. Functional components are just functions that return a React element.

### JSX

JSX is a syntax extension to JavaScript that allows you to write HTML-like code in your JavaScript files. It is not required to use JSX when writing React applications, but it is recommended. JSX makes your code more readable and easier to write. It also allows you to use the full power of JavaScript inside your HTML-like code.

### Props

Props are the way to pass data from a parent component to a child component. They are immutable and can only be changed by the parent component. Props are passed to a component as attributes in JSX.

### State

State is the way to store data inside a component. It is mutable and can be changed by the component itself.

You can initialize and use state using the `useState()` hook like this:

```typescript
const [counter, setCounter] = useState(0); // initialize with 0
setCounter(counter + 1); // increase counter by 1
```

### Hooks

Hooks are a new feature that was introduced in React 16.8. They allow you to use state and other React features without writing a class. Hooks are functions that can be called inside functional components. They allow you to use state and other React features without writing a class.

## TypeScript

The Telestion frontend is written in [TypeScript](https://www.typescriptlang.org/). TypeScript is a superset of JavaScript that adds static typing to the language. It is a strict superset of JavaScript, which means that any valid JavaScript code is also valid TypeScript code. TypeScript is a statically typed language, which means that the type of a variable is known at compile time. This allows the compiler to catch many errors at compile time instead of at runtime.

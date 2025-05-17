# Study Time Tracker

Study Time Tracker is an application designed to help you keep track of how much time you spend studying different subjects and visualizing your progress. It combines client-side JavaScript functionality with a robust F# backend.

Try-live link: https://csatapatkany73.github.io/Project-Omega/

![image](https://github.com/user-attachments/assets/57502750-4c14-4e0b-b6a4-e319afc7ceaf)
# EXPORTED HTML
![image](https://github.com/user-attachments/assets/260d57ef-cb58-43be-8269-15777152c4c7)


## Motivation

This project was born from the need to make it easier to track study time and improve learning efficiency. The application can be particularly useful for:

- Students: To track study time and manage priorities
- Educators: To analyze and optimize learning time
- Self-learners: To track time spent acquiring new skills
- Anyone looking to optimize their time: By managing deadlines and priorities

The project leverages F# functional programming for the server-side logic, combined with HTML, JavaScript, and CSS for the client interface, providing a robust and maintainable solution.

## Features

- Record study times for different subjects
- Compare planned vs. actual time spent
- Manage priorities (Primary, Secondary, Tertiary, Not Essential)
- Track deadlines
- Visual progress bars
- Multiple sorting options:
  - By priority
  - By deadline (ascending/descending)
  - Smart sorting (combination of priority and deadline)
- Generate reports in HTML format
- Mark tasks as completed
- F# backend for data processing and management

## Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- For development:
  - .NET 8 SDK
  - F# compiler
  - WebSharper (optional for enhanced F# to JavaScript compilation)

### Usage

1. Open the website: https://csatapatkany73.github.io/Project-Omega/
2. Enter the subject name and study-related data
3. Click the "Add" button
4. Add additional time to list items using the "Add" button
5. Check the "Completed" checkbox to mark a task as completed
6. Sort the list using various sorting options
7. Click "Export to HTML" to download a report

### Testing

If you want to try the application with sample data, use the "Random Statistics" button, which creates 5 random study entries.

## Project Structure

```
Project-Omega/
│
├── index.html            # Main HTML file
├── script.js             # JavaScript code
├── style.css             # CSS styles
│
├── Startup.fs            # F# ASP.NET Core startup configuration
├── Server.fs             # F# server-side logic
├── Client.fs             # F# WebSharper client code
│
└── wwwroot/              # Original files (archive)
    ├── Scripts/
    │   └── script.js
    └── css/
        └── style.css
```

## Technologies

- F# (.NET 8)
- WebSharper for F#-to-JavaScript compilation
- HTML5
- CSS3
- JavaScript (ES6+)
- ASP.NET Core

## Development

To run the application locally:

```bash
git clone https://github.com/Csatapatkany73/Project-Omega.git
cd Project-Omega
dotnet restore
dotnet run
```

Visit `http://localhost:5000` to see the application running locally.

## Author

Created by Roland Tamás Szentpéteri (GSG7MD)

---

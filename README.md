# Personal Growth OS — The Ultimate One-Year Learning Command Center

## Project Vision

Build a premium, minimalist, highly interactive Personal Growth Operating System designed specifically for long-term skill development.

This application is not a task manager.

This application is a visual learning command center that helps users stay consistent, motivated, and accountable over an entire year through powerful analytics, progress visualization, time tracking, forecasting, and intelligent insights.

The application should feel like a combination of:

* Notion
* Linear
* GitHub Insights
* Duolingo Streaks
* ClickUp Time Tracking
* Arc Browser

The user should feel excited every day when opening the dashboard.

---

# Primary Learning Tracks

Create 5 core tracks:

1. CPS Fundamentals
2. LeetCode
3. Development
4. System Design
5. Academic

---

# Hierarchical Learning Structure

Each track contains:

Track
→ Module
→ Topic
→ Subtopic

Example:

Development
→ Backend Engineering
→ Golang
→ Concurrency
→ Goroutines
→ Channels
→ Worker Pools

Users can:

* Create
* Edit
* Delete
* Archive
* Duplicate
* Reorder

for:

* Modules
* Topics
* Subtopics

Support drag-and-drop hierarchy management.

---

# Progress Management System

Each subtopic supports:

* Not Started
* In Progress
* Completed
* Mastered

Auto-calculate:

* Topic Progress
* Module Progress
* Track Progress
* Global Progress

Progress should update in real time.

Use:

* Animated progress bars
* Circular progress indicators
* Visual completion effects

---

# Difficulty Tracking

Every topic/subtopic supports:

* Easy
* Medium
* Hard
* Expert

Analytics should show:

* Time spent per difficulty
* Completion rate by difficulty
* Growth distribution

---

# Professional Time Tracking System (Core Feature)

Implement a premium time tracking system inspired by ClickUp, Toggl, and Clockify.

Users can:

* Start Timer
* Pause Timer
* Resume Timer
* Stop Timer
* Manual Time Entry
* Edit Time Logs

Time can be tracked at:

* Track Level
* Module Level
* Topic Level
* Subtopic Level

Example:

Development
→ Backend
→ Golang
→ Concurrency

User starts timer directly on Concurrency.

---

# Floating Focus Widget

While timer is active show:

* Current Activity
* Running Timer
* Today's Study Hours
* Session Duration

The timer should remain visible throughout the application.

---

# Learning Sessions

Store:

* Date
* Start Time
* End Time
* Duration
* Track
* Module
* Topic
* Subtopic
* Notes

Maintain complete historical records.

---

# Daily Journal

Allow users to record:

* What was learned
* Challenges faced
* Key takeaways
* Next actions

Connect journal entries with study sessions.

---

# Dashboard (Highest Priority)

Design a visually stunning dashboard.

The dashboard must be the most impressive page.

---

## Hero Section

Show:

* Total Learning Hours
* Overall Progress
* Current Streak
* Longest Streak
* Active Goals
* Days Remaining in Year

Large beautiful animated cards.

---

## Growth Command Center

Display:

* Total Hours Invested
* Modules Completed
* Topics Completed
* Subtopics Completed
* Completion Percentage
* Learning Momentum Score

---

## Track Overview Cards

Show for each track:

* Progress %
* Hours Invested
* Current Focus
* Remaining Topics
* Current Streak

Add hover animations.

---

## GitHub Style Activity Heatmap

Display:

* Daily learning activity
* Time spent
* Consistency

Allow:

* Weekly View
* Monthly View
* Yearly View

---

## Learning Momentum Score

Generate a score from:

* Consistency
* Hours invested
* Completion rate
* Recent activity

Scale:

* Poor
* Average
* Good
* Excellent
* Elite

---

## Goal Forecasting

Show:

If current pace continues:

* Estimated completion date
* Projected yearly hours
* Success probability
* Completion confidence

Display with beautiful charts.

---

## Learning Radar Chart

Visualize growth in:

* Algorithms
* Data Structures
* Competitive Programming
* Problem Solving
* Backend Engineering
* Databases
* Cloud
* DevOps
* System Design
* Academic Knowledge

---

# Analytics Section

Create a dedicated analytics page.

---

## Time Investment Analytics

Display:

* Daily Hours
* Weekly Hours
* Monthly Hours
* Yearly Hours

Use interactive charts.

---

## Time Distribution

Show:

How learning time is distributed.

Example:

Development → 40%
LeetCode → 25%
System Design → 15%
CPS → 12%
Academic → 8%

Use beautiful pie and donut charts.

---

## Focus Heatmap

Show:

Day of Week × Hour of Day

Identify:

* Most productive hours
* Most productive days
* Peak focus periods

Generate insights automatically.

---

## Topic Time Analysis

Display:

Most Studied Topics

Example:

Dynamic Programming → 42 Hours
Concurrency → 31 Hours
Distributed Systems → 18 Hours

---

## Learning Velocity

Measure:

* Topics Completed Per Week
* Modules Completed Per Month
* Track Progress Speed

Display trends.

---

## Efficiency Analytics

Calculate:

Efficiency Score = Progress Achieved ÷ Hours Invested

Compare:

* Tracks
* Modules
* Topics

Highlight highest ROI learning areas.

---

## Completion Trends

Show:

* Weekly Progress
* Monthly Progress
* Yearly Progress

Use smooth animated line charts.

---

## Productivity Trends

Compare:

* Planned Progress
* Actual Progress

Highlight deviations.

---

# Smart Insights Engine

Generate AI-style insights automatically.

Examples:

"You spent 38% of your time on Development."

"System Design has not been studied for 12 days."

"Your productivity is highest between 9 PM and 11 PM."

"You are progressing faster in Backend Development than in LeetCode."

"If you maintain this pace, you will exceed your yearly target by 180 hours."

Insights should feel intelligent and personalized.

---

# Motivation System

Create a rewarding experience.

---

## Streak System

Track:

* Current Streak
* Longest Streak
* Missed Days

---

## Achievement System

Unlock achievements:

* First Study Session

* First 10 Hours

* First 50 Hours

* First 100 Hours

* First 500 Hours

* First 1000 Hours

* 7 Day Streak

* 30 Day Streak

* 100 Day Streak

* First Module Completed

* First Track Completed

Show premium celebration animations.

---

## Milestone Timeline

Visual timeline showing:

* Major accomplishments
* Hours milestones
* Completion milestones

---

# Annual Review Generator

Generate a beautiful yearly report.

Include:

* Total Hours Invested
* Total Sessions
* Average Session Length
* Topics Completed
* Modules Completed
* Best Month
* Best Week
* Longest Streak
* Most Studied Track
* Most Studied Topic

Generate narrative insights automatically.

Allow export as:

* PDF
* Image
* Shareable Report

---

# Data Management

Store everything locally.

Preferred:

* IndexedDB via Dexie

Support:

* Export Data
* Import Data
* Backup
* Restore

No authentication required.

Offline-first architecture.

---

# UI / UX Requirements

Style:

* Minimalist
* Premium
* Modern
* Clean
* Professional

Theme:

* Dark Mode First

Inspiration:

* Linear
* Arc Browser
* Notion
* Raycast

Typography:

* Inter
* Geist

Use:

* Glassmorphism
* Smooth gradients
* Micro interactions
* Elegant shadows
* Framer Motion animations

Avoid clutter.

Every screen should feel focused and motivating.

---

# Technical Stack

Frontend:

* Next.js 15
* TypeScript
* TailwindCSS
* Shadcn UI

State Management:

* Zustand

Database:

* Dexie + IndexedDB

Charts:

* Recharts
* Tremor

Animation:

* Framer Motion

Drag & Drop:

* DnD Kit

Forms:

* React Hook Form
* Zod

Desktop Ready:

* PWA
* Optional Tauri Support

---

# Future Expansion

Design architecture to support:

* AI Study Coach
* AI Learning Recommendations
* LeetCode Integration
* Codeforces Integration
* GitHub Integration
* Calendar Sync
* AWS Learning Roadmap
* Kubernetes Learning Roadmap
* Mobile App
* Cloud Sync

---

# Success Criteria

The application should become the user's daily command center.

When opened, it should immediately answer:

* What am I learning?
* How much time have I invested?
* How consistent am I?
* Am I on track to achieve my yearly goals?
* Which skill is growing fastest?
* What should I focus on next?

The final product should feel like a premium personal growth platform that motivates the user to learn consistently for the next year and provides meaningful visual proof of progress every single day.

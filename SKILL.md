---
name: stitch-design
description: Use this skill whenever a new frontend UI, screen, redesign, or visual exploration is required. The design must first be generated or refined using Google Stitch MCP tools before implementing code.
---

# Stitch Design

This skill defines how the agent should use **Google Stitch** to generate and iterate UI designs before implementing frontend code.

Stitch should be treated as the **default UI exploration tool** for new screens or major UI changes.

---

# When to use

Use this skill when:

- A new frontend screen or page needs to be created.
- An existing UI requires redesign or visual improvement.
- The user asks for UI alternatives or visual variants.
- The user provides a screenshot, wireframe, or mockup as reference.
- The agent needs a visual direction before writing frontend code.

Do NOT implement UI code immediately if the design direction is unclear.  
First generate or refine the design using Stitch.

---

# Required workflow

The agent must follow this workflow:

1. Inspect existing Stitch projects using:

```
mcp__stitch__list_projects
```

2. If an appropriate project exists, reuse it.  
Otherwise create a new one with:

```
mcp__stitch__create_project
```

3. Generate the initial screen using:

```
mcp__stitch__generate_screen_from_text
```

When generating screens, default to the following parameters unless the user explicitly requests something different:

- platform: web
- viewport size: 1280x1024
- layout mode: desktop-first

Designs should prioritize desktop layouts suitable for enterprise applications, using horizontal space efficiently (tables, filter bars, side navigation, drawers) and then adapt responsively to smaller screens.

4. If the user provided images, wireframes, or screenshots, use:

```
mcp__stitch__upload_screens_from_images
```

5. Inspect generated screens with:

```
mcp__stitch__list_screens
mcp__stitch__get_screen
```

6. Refine the design iteratively using:

```
mcp__stitch__edit_screens
```

7. If the user wants alternative design directions, use:

```
mcp__stitch__generate_variants
```

8. If multiple screens should share visual consistency, manage design systems:

```
mcp__stitch__list_design_systems
mcp__stitch__create_design_system
mcp__stitch__update_design_system
mcp__stitch__apply_design_system
```

9. Only after the UI direction is clear, proceed to implement the frontend in:

```
src/frontend/app
```

---

# Prompt expansion rules

If the user provides a **short or vague prompt**, the agent must expand it into a detailed design brief before sending it to Stitch.

Never send prompts like:

- "create a dashboard"
- "make a login page"
- "design a users screen"

Instead expand them into a structured description including:

- screen goal
- target user
- key actions
- layout structure
- content blocks
- responsive behavior
- visual tone

---

# Prompt structure guidelines

When generating prompts for Stitch, include:

### Screen purpose

What problem the screen solves.

### Target user

Administrator, customer, operator, etc.

### Key actions

Main CTAs and user interactions.

### Content structure

Examples:

- header
- filter bar
- tables
- cards
- side panels
- modals
- navigation

### Layout expectations

Example:

- sidebar layout
- dashboard layout
- split view
- wizard flow

### Responsive behavior

Describe how the screen should behave on mobile.

### Visual tone

Examples:

- enterprise
- modern
- minimal
- dense
- friendly
- technical

---

# Example prompt

Bad prompt:

```
Create a user management page
```

Good prompt:

```
Create a modern enterprise user management interface for administrators.

Include:
- page header with title and primary CTA for creating a user
- search and filter bar
- paginated table of users with columns for name, email, role, and status
- status badges
- row actions for edit and delete
- right-side drawer for editing a selected user
- empty state for no results
- loading and error states

The layout should prioritize desktop use with a dense table layout, while providing a simplified stacked layout for mobile screens.
```

---

# Iteration rules

When refining designs:

- Prefer **small focused edits** using `mcp__stitch__edit_screens`.
- Avoid editing too many aspects in a single request.
- Use `generate_variants` when exploring alternative visual directions.
- Inspect results before generating new edits.

---

# Repository constraints

The final UI implementation must:

- Be implemented in `src/frontend/app`
- Use the repository stack:

```
Next.js
React
TypeScript
```

Backend integrations must continue to use environment variables already defined in the repository.

Stitch is responsible for **design direction**, not implementation code.

---

# Key principle

Design first → Implementation second.

Always establish a clear UI direction with Stitch before writing frontend code.
# Product Requirements Document (PRD)

## Document Info
- **Project Name**: [Enter project name]
- **Version**: [1.0]
- **Date**: [YYYY-MM-DD]
- **Author**: [Your name]
- **Status**: [Draft / In Review / Approved]

---

## 1. Executive Summary

### 1.1 Project Overview
[Provide a 2-3 sentence description of what you're building. Be specific about the type of application (web app, mobile app, API, etc.)]

**Example**: *A task management web application that allows teams to create, assign, and track tasks with real-time updates and Slack integration.*

### 1.2 Target Users
- **Primary Users**: [e.g., Project managers, software developers]
- **Secondary Users**: [e.g., Team leads, executives]

### 1.3 Key Value Proposition
[One sentence describing the main benefit - what problem does this solve?]

---

## 2. User Stories

### Format
Use this format for each user story:
```
As a [type of user], I want [goal] so that [benefit]
```

### Stories

#### Story 1: [Story Title]
- **As a** [user type]
- **I want to** [action]
- **So that** [benefit]
- **Priority**: [Must have / Should have / Could have]
- **Estimated Effort**: [Small / Medium / Large]

#### Story 2: [Story Title]
- **As a** [user type]
- **I want to** [action]
- **So that** [benefit]
- **Priority**: [Must have / Should have / Could have]
- **Estimated Effort**: [Small / Medium / Large]

---

## 3. Functional Requirements

### Requirement ID Format
Use format: `FR-[XXX]` (e.g., FR-001, FR-002)

### Requirements List

#### FR-001: [Feature Name]
- **Description**: [Detailed description of what this feature does]
- **Priority**: [P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)]
- **User Stories**: [Link to related user stories]
- **Acceptance Criteria**:
  - [ ] [Specific, testable criterion 1]
  - [ ] [Specific, testable criterion 2]
  - [ ] [Specific, testable criterion 3]
- **UI/UX Notes**: [Any specific UI requirements]
- **API Dependencies**: [If any]

#### FR-002: [Feature Name]
- **Description**: [Detailed description]
- **Priority**: [P0 / P1 / P2 / P3]
- **User Stories**: [Link]
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **UI/UX Notes**: [Notes]

---

## 4. Technical Architecture

### 4.1 Tech Stack
Specify your preferred stack:

```yaml
Frontend:
  Framework: [React / Vue / Svelte / Next.js / etc.]
  UI Library: [Tailwind CSS / Material-UI / Chakra / etc.]
  State Management: [Redux / Zustand / Context API / etc.]
  
Backend:
  Framework: [Node.js/Express / Python/FastAPI / etc.]
  Database: [PostgreSQL / MongoDB / Supabase / etc.]
  
Authentication: [Auth0 / Firebase Auth / JWT / etc.]
  
Hosting: [Vercel / AWS / Railway / etc.]
  
Third-party APIs:
  - [API name and purpose]
```

### 4.2 Database Schema

#### Entity: [Entity Name]
```
Table: [table_name]
- id: [type, primary key]
- [field]: [type, constraints]
- [field]: [type, constraints]
- created_at: [timestamp]
- updated_at: [timestamp]

Relationships:
- [Relationship description, e.g., "has many", "belongs to"]
```

#### Entity: [Another Entity]
```
Table: [table_name]
- id: [type]
- [field]: [type]
```

### 4.3 API Endpoints

#### Endpoint Group: [Group Name]

**[METHOD] /[endpoint-path]**
- **Description**: [What this endpoint does]
- **Authentication**: [Required / Public]
- **Request Body**:
  ```json
  {
    "field": "type - description"
  }
  ```
- **Response (200)**:
  ```json
  {
    "field": "type - description"
  }
  ```
- **Error Responses**:
  - `400`: [Error description]
  - `401`: [Error description]
  - `404`: [Error description]

---

## 5. UI/UX Requirements

### 5.1 Pages/Routes

#### Page: [Page Name]
- **Route**: `/[path]`
- **Description**: [What this page does]
- **Components**:
  - `[ComponentName]`: [Purpose]
  - `[ComponentName]`: [Purpose]
- **Layout**: [Layout description, e.g., "Two-column with sidebar"]
- **Responsive Behavior**: [Mobile/tablet/desktop differences]
- **Design Reference**: [Link to Figma, screenshot, or description]

#### Page: [Another Page]
- **Route**: `/[path]`
- **Description**: [Description]
- **Components**: [List]

### 5.2 Component Library

#### Component: [Component Name]
```typescript
// Props interface
interface [ComponentName]Props {
  prop1: type;        // description
  prop2?: type;       // description (optional)
  onEvent: () => void; // event handler
}

// Usage example
<[ComponentName]
  prop1={value}
  onEvent={handler}
/>
```

**Styling Requirements**:
- [Specific CSS/Tailwind requirements]
- [Color scheme: e.g., primary: #XXX, secondary: #XXX]
- [Typography: fonts, sizes]

### 5.3 Navigation Structure
```
- Home (/)
  - Feature A (/feature-a)
    - Sub-feature (/feature-a/sub)
  - Feature B (/feature-b)
- Profile (/profile)
- Settings (/settings)
```

### 5.4 Key User Flows

#### Flow: [Flow Name]
1. User [action]
2. System [response]
3. User [next action]
4. System [final result]

**Edge Cases**:
- [Edge case 1]: [Expected behavior]
- [Edge case 2]: [Expected behavior]

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time: `< [X] seconds`
- Time to interactive: `< [X] seconds`
- API response time: `< [X] ms` for p95
- Support [X] concurrent users

### 6.2 Browser Support
- Chrome: [version]+
- Firefox: [version]+
- Safari: [version]+
- Edge: [version]+

### 6.3 Accessibility
- WCAG 2.1 Level [A / AA / AAA] compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratio: [minimum ratio]

### 6.4 Security
- Authentication method: [method]
- Data encryption: [in transit / at rest requirements]
- Input validation requirements
- CORS policy: [policy]

---

## 7. File Structure

Specify the desired project structure:

```
project-root/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Shared components (Button, Input, etc.)
│   │   └── [feature]/      # Feature-specific components
│   ├── pages/              # Page components/routes
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API calls and external services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── store/              # State management
│   └── styles/             # Global styles, themes
├── public/                 # Static assets
├── tests/                  # Test files
├── docs/                   # Documentation
└── [config files]
```

---

## 8. Development Instructions for AI

### 8.1 Coding Standards
```yaml
Language: [TypeScript / JavaScript / Python / etc.]

Style Guidelines:
  - Use [ESLint/Prettier/Biome] for formatting
  - Component naming: [PascalCase / other]
  - File naming: [kebab-case / camelCase / other]
  - Variable naming: [camelCase / snake_case]
  
Code Organization:
  - One component per file
  - Co-locate tests with components (*.test.tsx)
  - Group by feature, not by type
```

### 8.2 Implementation Priorities

**Phase 1 - MVP (Must Have)**
- [ ] [Feature/FR-ID]
- [ ] [Feature/FR-ID]
- [ ] [Feature/FR-ID]

**Phase 2 - Enhancements (Should Have)**
- [ ] [Feature/FR-ID]
- [ ] [Feature/FR-ID]

**Phase 3 - Nice to Have (Could Have)**
- [ ] [Feature/FR-ID]
- [ ] [Feature/FR-ID]

### 8.3 Specific Instructions

#### Do:
- [Instruction 1: e.g., "Use React Server Components where possible"]
- [Instruction 2: e.g., "Implement optimistic updates for better UX"]
- [Instruction 3: e.g., "Use TypeScript strict mode"]

#### Don't:
- [Instruction 1: e.g., "Don't use inline styles"]
- [Instruction 2: e.g., "Don't commit API keys to code"]

---

## 9. Testing Requirements

### 9.1 Testing Strategy
```yaml
Unit Tests: [Required / Recommended]
  Framework: [Jest / Vitest / etc.]
  Coverage Target: [X]%

Integration Tests: [Required / Recommended]
  Framework: [React Testing Library / Cypress / Playwright]

E2E Tests: [Required / Recommended]
  Framework: [Cypress / Playwright]
  Critical Paths:
    - [Flow 1 description]
    - [Flow 2 description]
```

### 9.2 Test Cases for Critical Features

#### Feature: [Feature Name]
```
Test Case 1: [Test name]
  Given: [Initial state]
  When: [Action]
  Then: [Expected outcome]

Test Case 2: [Test name]
  Given: [Initial state]
  When: [Action]
  Then: [Expected outcome]
```

---

## 10. Deployment & DevOps

### 10.1 Environment Setup
```yaml
Development:
  - Local database: [type/setup]
  - Environment variables: [list required .env variables]

Staging:
  - URL: [staging URL]
  - Database: [setup]

Production:
  - URL: [production URL]
  - Database: [setup]
```

### 10.2 CI/CD Requirements
- [ ] Automated testing on PR
- [ ] Linting checks
- [ ] Build verification
- [ ] Deployment triggers: [manual / automatic]

---

## 11. Dependencies

### 11.1 Core Dependencies
```json
{
  "[package-name]": "^[version] - [purpose]",
  "[package-name]": "^[version] - [purpose]"
}
```

### 11.2 Dev Dependencies
```json
{
  "[package-name]": "^[version] - [purpose]"
}
```

---

## 12. Open Questions

| Question | Answer (when resolved) |
|----------|----------------------|
| [Question 1]? | [Answer] |
| [Question 2]? | [Answer] |

---

## 13. References

### 13.1 Design Assets
- Figma: [URL or "N/A"]
- Brand guidelines: [URL or "N/A"]
- Asset folder: [path or "N/A"]

### 13.2 Documentation
- API Documentation: [URL]
- Third-party service docs: [URLs]
- Related PRDs: [links]

### 13.3 Research
- User research summary: [link/attachment]
- Competitor analysis: [link/attachment]

---

## 14. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | [YYYY-MM-DD] | [Name] | Initial draft |
| 0.2 | [YYYY-MM-DD] | [Name] | [Description of changes] |

---

## Quick Reference for AI Tools

When using this PRD with AI coding platforms:

### For Lovable:
1. Paste relevant sections into the chat
2. Reference specific FR-IDs when requesting features
3. Include database schema section for data structure
4. Specify tech stack clearly

### For Cursor:
1. Save this file in your project root
2. Use `@filename.md` to reference it in chat
3. Ask AI to implement specific requirements by ID
4. Use the file structure section for project setup

### For v0:
1. Paste the UI/UX section with page descriptions
2. Include component specifications
3. Reference design requirements

### For Bolt/Windsurf:
1. Provide the full PRD
2. Specify Phase 1 features for initial generation
3. Reference database schema for data layer

### For GitHub Copilot:
1. Open this file alongside your code
2. Use comments referencing FR-IDs
3. Let Copilot suggest implementations based on acceptance criteria

---

**End of Document**

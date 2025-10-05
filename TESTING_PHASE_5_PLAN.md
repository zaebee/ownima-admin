# Testing Phase 5: Increase Coverage to 70%+

## Current Coverage: 44.44%
**Target: 70%+**

## Priority Areas (0% Coverage)

### 🔴 Critical - Layout Components (0% coverage)
These are used on every page and need testing:

1. **Header.tsx** (0% - 83 lines)
   - User menu dropdown
   - Logout functionality
   - User display
   - Navigation

2. **Sidebar.tsx** (0% - 149 lines)
   - Navigation links
   - Active state
   - Collapse/expand
   - localStorage persistence

3. **Layout.tsx** (0% - 36 lines)
   - Component composition
   - Routing integration

### 🔴 Critical - Pages (0% coverage)
4. **LandingPage.tsx** (0% - 72 lines)
   - Public landing page
   - Navigation to login
   - Marketing content

5. **SystemPage.tsx** (0% - 599 lines)
   - System monitoring
   - Error logs
   - User activity
   - System info display

6. **UserDetailPage.tsx** (0% - 553 lines)
   - User profile view
   - Edit functionality
   - Activity history
   - Role management

### 🟡 Medium Priority - Modals (3% coverage)
7. **UserCreateModal.tsx** (2.86% - 305 lines)
   - Form validation
   - User creation
   - Error handling

8. **UserEditModal.tsx** (3.73% - 264 lines)
   - Form validation
   - User updates
   - Error handling

### 🟡 Medium Priority - Components
9. **ConfirmDialog.tsx** (5.74% - 119 lines)
   - Confirmation dialogs
   - Action callbacks
   - Cancel/confirm flow

10. **ActivityTimeline.tsx** (0% - 126 lines)
    - Activity display
    - Timeline rendering
    - Date formatting

11. **FilterPanel.tsx** (57.14% - needs improvement)
    - Filter controls
    - State management
    - Apply/reset filters

### 🟢 Low Priority - Hooks
12. **useToast.ts** (0% - 60 lines)
    - Toast notifications
    - Context integration

### 🟢 Low Priority - Other
13. **App.tsx** (0% - 67 lines)
    - Router setup
    - Provider composition

14. **ToastContext.tsx** (64.86% - needs improvement)
    - Toast management
    - Auto-dismiss
    - Multiple toasts

## Testing Strategy

### Phase 5A: Layout Components (Priority 1)
**Estimated Time: 2-3 hours**
**Impact: High - used on every page**

- [ ] Header.test.tsx
  - Render with user
  - User menu interactions
  - Logout flow
  - Navigation

- [ ] Sidebar.test.tsx
  - Navigation links
  - Active state highlighting
  - Collapse/expand functionality
  - localStorage persistence

- [ ] Layout.test.tsx
  - Component composition
  - Children rendering
  - Integration with Header/Sidebar

**Expected Coverage Increase: +5-7%**

### Phase 5B: Critical Pages (Priority 2)
**Estimated Time: 4-5 hours**
**Impact: High - major features**

- [ ] LandingPage.test.tsx
  - Render content
  - Navigation to login
  - Responsive layout

- [ ] SystemPage.test.tsx
  - System info display
  - Error logs rendering
  - User activity list
  - Filtering/sorting
  - Loading states
  - Error states

- [ ] UserDetailPage.test.tsx
  - User profile display
  - Edit mode toggle
  - Activity history
  - Role management
  - Loading states
  - Error handling

**Expected Coverage Increase: +15-20%**

### Phase 5C: Modals & Dialogs (Priority 3)
**Estimated Time: 3-4 hours**
**Impact: Medium - user interactions**

- [ ] UserCreateModal.test.tsx
  - Form rendering
  - Validation
  - Submit flow
  - Error handling
  - Cancel action

- [ ] UserEditModal.test.tsx
  - Form pre-population
  - Validation
  - Update flow
  - Error handling
  - Cancel action

- [ ] ConfirmDialog.test.tsx
  - Render with message
  - Confirm action
  - Cancel action
  - Keyboard interactions

**Expected Coverage Increase: +8-10%**

### Phase 5D: Remaining Components (Priority 4)
**Estimated Time: 2-3 hours**
**Impact: Medium**

- [ ] ActivityTimeline.test.tsx
  - Activity rendering
  - Empty state
  - Date formatting
  - Activity types

- [ ] Improve FilterPanel.test.tsx
  - All filter types
  - Apply/reset
  - State management

- [ ] useToast.test.ts
  - Hook functionality
  - Context integration

**Expected Coverage Increase: +3-5%**

### Phase 5E: App & Context Improvements (Priority 5)
**Estimated Time: 1-2 hours**
**Impact: Low**

- [ ] App.test.tsx
  - Router setup
  - Provider composition
  - Route rendering

- [ ] Improve ToastContext.test.tsx
  - Multiple toasts
  - Auto-dismiss
  - Toast queue

**Expected Coverage Increase: +2-3%**

## Total Estimated Impact

| Phase | Time | Coverage Increase | New Coverage |
|-------|------|-------------------|--------------|
| Current | - | - | 44.44% |
| 5A: Layout | 2-3h | +5-7% | ~50% |
| 5B: Pages | 4-5h | +15-20% | ~68% |
| 5C: Modals | 3-4h | +8-10% | ~78% |
| 5D: Components | 2-3h | +3-5% | ~82% |
| 5E: App/Context | 1-2h | +2-3% | ~85% |
| **Total** | **12-17h** | **+33-45%** | **~75-85%** |

## Implementation Order

### Today's Goal: Phase 5A (Layout Components)
Start with layout components since they're:
1. Used on every page
2. Relatively simple to test
3. High impact on coverage
4. Foundation for page tests

### This Week's Goal: Phases 5A + 5B
Complete layout and critical pages to reach ~68% coverage

### Next Week's Goal: Phases 5C + 5D
Add modal and component tests to reach ~82% coverage

## Success Metrics

- [ ] Coverage reaches 70%+ (minimum goal)
- [ ] Coverage reaches 80%+ (stretch goal)
- [ ] All critical user flows tested
- [ ] All layout components tested
- [ ] All pages have basic tests
- [ ] CI pipeline passes
- [ ] No regression in existing tests

## Notes

- Focus on user-facing functionality first
- Don't aim for 100% coverage on complex components
- Prioritize happy paths and error states
- Use existing test patterns from Phase 1-4
- Update coverage thresholds after each phase

# Test Coverage Improvement Plan - Phase 2

## Current Status (as of commit 7e93a8f)

### ✅ Completed - Phase 1 (Utilities + 1 Component)
- [x] csvExport.test.ts - 31 tests (51 lines coverage)
- [x] dataNormalization.test.ts - 51 tests (71 lines coverage)
- [x] dateFormatting.test.ts - 48 tests (~70 lines coverage)
- [x] UserBadges.test.tsx - 31 tests (41 lines coverage)

**Total:** 161 tests, ~233 lines covered
**Patch Coverage Improvement:** +15-16% (from 29.74% to ~44-46%)

---

## 🎯 Next Steps - Phase 2 Component Tests

### Priority 1: RatingStars Component (68 lines)
**File:** `src/components/ui/RatingStars.test.tsx`

**Test Coverage:**
- [ ] Star rendering (0-5 stars)
- [ ] Half-star support (0.5, 1.5, 2.5, etc.)
- [ ] Size variants (sm, md, lg)
- [ ] Show/hide value prop
- [ ] No rating state handling
- [ ] Custom className support
- [ ] Accessibility (aria-labels)

**Estimated:** 25-30 tests, 30 minutes

---

### Priority 2: UserProfileHeader Component (79 lines)
**File:** `src/components/ui/UserProfileHeader.test.tsx`

**Test Coverage:**
- [ ] Avatar rendering (with image, fallback initial)
- [ ] Active status indicator (green/gray dot)
- [ ] Name and email display
- [ ] UserBadges integration
- [ ] Color scheme variants (blue/green gradients)
- [ ] Additional info slot (rating stars)
- [ ] Actions slot (edit/delete buttons)
- [ ] Responsive layout

**Estimated:** 30-35 tests, 45 minutes

---

### Priority 3: BulkActionBar Component (43 lines)
**File:** `src/components/ui/BulkActionBar.test.tsx`

**Test Coverage:**
- [ ] Renders when selectedCount > 0
- [ ] Hides when selectedCount = 0
- [ ] Selection count display
- [ ] Select All button click
- [ ] Clear Selection button click
- [ ] Activate button click
- [ ] Deactivate button click
- [ ] Delete button click
- [ ] Loading states (disabled buttons)
- [ ] Sticky positioning

**Estimated:** 20-25 tests, 30 minutes

---

## 📊 Expected Results After Phase 2

**Additional Coverage:**
- RatingStars: 68 lines
- UserProfileHeader: 79 lines
- BulkActionBar: 43 lines

**Total New Coverage:** +190 lines (~11% improvement)
**Estimated Patch Coverage:** ~55-57% (current ~44-46% + 11%)

---

## 🚀 Phase 3 - Service Tests (Optional)

### Admin Service Bulk Operations (67 lines)
**File:** Extend `src/services/admin.test.ts`

**Test Coverage:**
- [ ] bulkActivateUsers - successful activation
- [ ] bulkActivateUsers - partial failures (Promise.allSettled)
- [ ] bulkDeactivateUsers - successful deactivation
- [ ] bulkDeactivateUsers - partial failures
- [ ] bulkDeleteUsers - successful deletion
- [ ] bulkDeleteUsers - user type routing (RIDER vs OWNER)
- [ ] bulkDeleteUsers - partial failures
- [ ] Error message formatting

**Estimated:** 20-25 tests, 1 hour

**Additional Coverage:** +67 lines (~4% improvement)
**Estimated Patch Coverage:** ~59-61% (after Phase 3)

---

## 📝 Quick Start Guide

### When Ready to Continue:

```bash
# 1. Pull latest changes
git pull origin feat/riders

# 2. Create RatingStars test file
# Copy pattern from UserBadges.test.tsx

# 3. Run tests continuously
npm run test:watch -- src/components/ui/RatingStars.test.tsx

# 4. Check coverage
npm run test:coverage

# 5. Commit when done
git add src/components/ui/RatingStars.test.tsx
git commit -m "test: add comprehensive RatingStars component tests"
git push
```

### Test File Templates

**Component Test Structure:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ComponentName />);
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    // Test different prop combinations
  });

  describe('User Interactions', () => {
    // Test click handlers, etc.
  });

  describe('Edge Cases', () => {
    // Test null values, edge cases
  });
});
```

---

## 🎯 Success Criteria

- [ ] All new tests passing (npm run test:run)
- [ ] No TypeScript errors (npm run build)
- [ ] Coverage improvement visible in Codecov report
- [ ] Patch coverage target: 55%+ (good), 60%+ (excellent)

---

## 📚 References

- Existing test patterns: `src/components/ui/Button.test.tsx`
- Existing service tests: `src/services/admin.test.ts`
- React Testing Library docs: https://testing-library.com/react
- Vitest docs: https://vitest.dev

---

Generated: 2025-11-16
Last Updated: commit 7e93a8f

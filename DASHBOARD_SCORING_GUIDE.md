# Dashboard Scoring Guide

## How Dashboard Health Scores Work

The 6 health scores on your dashboard are now **dynamically calculated** based on which topics you complete. When you mark a topic as complete on the **Topics** page, the relevant dashboard scores update automatically.

---

## Complete Topic-to-Score Mapping

| # | Topic Name | Affects These Scores |
|---|-----------|---------------------|
| 1 | Fund | 💰 Funding Readiness |
| 2 | Strategic | 💼 Operations |
| 3 | Taxation | 📋 Compliance + ⚠️ Risk Control |
| 4 | Land / Legal | 📋 Compliance |
| 5 | Licence | 📋 Compliance |
| 6 | Loans | 💰 Funding Readiness |
| 7 | Risk Management | ⚠️ Risk Control |
| 8 | Project Management | 💼 Operations |
| 9 | Cyber Security | 🔒 Cyber Security |
| 10 | Registration / Structure | 📋 Compliance |
| 11 | Export | *(Not currently scored)* |
| 12 | NDA / Exit | 📋 Compliance |
| 13 | Industrial Connect | 💼 Operations |
| 14 | Customer Support | 💼 Operations |

---

## Score Categories Explained

### 📋 **Compliance** (5 topics)
Topics that affect this score:
- Land / Legal
- Licence
- Registration / Structure
- NDA / Exit
- Taxation

**Formula:** (Completed Topics / 5) × 100

---

### 💰 **Funding Readiness** (2 topics)
Topics that affect this score:
- Fund
- Loans

**Formula:** (Completed Topics / 2) × 100

---

### ⚠️ **Risk Control** (2 topics)
Topics that affect this score:
- Risk Management
- Taxation

**Formula:** (Completed Topics / 2) × 100

---

### 💼 **Operations** (4 topics)
Topics that affect this score:
- Project Management
- Strategic
- Industrial Connect
- Customer Support

**Formula:** (Completed Topics / 4) × 100

---

### 🔒 **Cyber Security** (1 topic)
Topics that affect this score:
- Cyber Security

**Formula:** Completed ? 100 : 0

---

### 📊 **Overall Health** (Average)
**Formula:** (Compliance + Funding + Risk + Operations + Cyber) / 5

---

## How to Increase Your Scores

### Step-by-Step Process:

1. **Navigate to Topics Page**
   - Click "Topics Advisor" in the sidebar

2. **Select a Topic**
   - Click on any topic button to view AI guidance
   - The AI will provide 300-500 words of personalized advice

3. **Read the Guidance**
   - Review the recommendations
   - Understand what actions to take

4. **Mark as Complete**
   - Click the "Mark as Complete" button
   - Green checkmark will appear on the topic

5. **Check Dashboard**
   - Return to Dashboard
   - See your scores update in real-time!

---

## Progress Tracking

### Visual Indicators:
- **Green badges** on completed topics
- **Progress bar** showing overall completion (0-100%)
- **Percentage display** on each health score card
- **Animated progress bars** beneath each score

### Current Progress Display:
- "X of 14 topics completed • Y remaining"
- List of completed topics as green badges
- Next steps suggestion panel

---

## Special Notes

### Taxation Topic Bonus:
The **Taxation** topic is counted in BOTH:
- 📋 Compliance score
- ⚠️ Risk Control score

Completing this one topic boosts TWO dashboard scores!

### Export Topic:
Currently not mapped to any health score. Can be completed for general knowledge but won't affect dashboard percentages.

---

## Example Progression

### Starting State (0 topics):
```
Overall Health:     0%
Compliance:         0%
Funding Readiness:  0%
Risk Control:       0%
Operations:         0%
Cyber Security:     0%
```

### After Completing "Cyber Security" (1 topic):
```
Overall Health:     20%  (1/5 categories at 100%)
Compliance:         0%
Funding Readiness:  0%
Risk Control:       0%
Operations:         0%
Cyber Security:     100% ✅
```

### After Completing All Funding Topics (3 total):
```
Overall Health:     40%  (2/5 categories at 100%)
Compliance:         0%
Funding Readiness:  100% ✅ (Fund + Loans)
Risk Control:       0%
Operations:         0%
Cyber Security:     100% ✅
```

### After Completing All 14 Topics:
```
Overall Health:     100% 🎉
Compliance:         100% ✅
Funding Readiness:  100% ✅
Risk Control:       100% ✅
Operations:         100% ✅
Cyber Security:     100% ✅
```

---

## Technical Implementation

### Files Modified:
1. **`client/src/context/AppContext.tsx`**
   - Added `calculateHealthScores()` function
   - Maps topics to score categories
   - Calculates percentages dynamically
   - Exports `healthScores` object

2. **`client/src/pages/Dashboard.tsx`**
   - Removed dependency on static API scores
   - Now uses `healthScores` from AppContext
   - Adds description tooltips to each score card
   - Real-time updates when topics completed

### State Management:
- All topic completion state stored in `AppContextProvider`
- Scores recalculated on every render
- No backend persistence (prototype behavior)
- Resets on page refresh

---

## Troubleshooting

### Scores Not Updating?
1. Ensure you clicked "Mark as Complete"
2. Check that green checkmark appears on topic
3. Navigate back to Dashboard to see changes
4. Scores update immediately (no page refresh needed)

### Score Seems Wrong?
- Check which topics are marked complete (green badges)
- Verify the topic mappings in this guide
- Remember: Taxation counts for 2 categories

### Want to Reset Progress?
- Refresh the browser page (F5)
- All progress is in-memory only
- No data persists between sessions

---

## Future Enhancements

Potential improvements:
- Persist completion state to backend
- Add "Undo" button for accidental completions
- Show which topics contribute to each score (hover tooltip)
- Add confetti animation when reaching 100%
- Export completion certificate

---

**Happy Learning! 🚀**

Your dashboard now truly reflects your mentorship journey progress!

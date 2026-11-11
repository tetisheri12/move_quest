# Move Quest

A simple weekly indoor-activity site for an 11-year-old. Plain HTML, CSS and JavaScript — no backend, no account, no paid dependencies, no build step.

## Files

```
index.html   page structure, safety notice, sources
styles.css   layout and theme (responsive, phone-first)
app.js       schedule, videos, logging, XP, badges, export/import
```

## Weekly plan

| Day | Activity |
|---|---|
| Monday | Body Coach 5 Minute Move (optional second round) |
| Tuesday | Usual swimming session, about 1 hour |
| Wednesday | School sport — record the actual time |
| Thursday | Nuffield Health video, with pauses and easier options |
| Friday | Choose either video |
| Saturday | Choose a video or another enjoyable activity |
| Sunday | Optional gentle movement, or rest |

These are starter home sessions, not the whole day's activity target.

## How progress works

- Every participation (done, adapted or partial) = **10 XP**, once per activity per date.
- Rest and Reschedule never cost anything; rest days are never shown as failures.
- Badges are personal and based on taking part. No streaks, leaderboards, weight, calories or appearance goals.
- Planned times start blank — set them on any card.
- Progress is stored in the browser's `localStorage` **on that device only**. It does not sync. Use **Export** / **Import** (JSON) to move it, and **Reset** (double confirmation) to clear it.


## Sources

- The Body Coach TV — 5 Minute Move, Kids Workout 1: https://www.youtube.com/watch?v=d3LPrhI0v-w
- Nuffield Health — kids' workout: https://www.youtube.com/watch?v=aHVR2FnTpdk
- Nuffield Health — At-home workouts for kids: https://www.nuffieldhealth.com/article/at-home-workouts-for-kids
- NHS — Physical activity guidelines for children and young people: https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-children-and-young-people/
- UK Chief Medical Officers' physical activity guidelines (2019): https://www.gov.uk/government/publications/physical-activity-guidelines-uk-chief-medical-officers-report
- WHO — Physical activity fact sheet: https://www.who.int/news-room/fact-sheets/detail/physical-activity

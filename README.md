# Move Quest

A simple weekly indoor-activity site for an 11-year-old. Plain HTML, CSS and JavaScript — no backend, no account, no paid dependencies, no build step.

## Files

```
index.html   page structure, safety notice, sources
styles.css   layout and theme (responsive, phone-first)
app.js       schedule, 4-week programme, logging, XP, badges, export/import
apple-touch-icon.png, favicon.png   app icons
```

Blocky pixel-adventure look (pixel font "Pixelify Sans" from Google Fonts, falls back to system fonts offline). Laid out for an 11" iPad: two columns in landscape, one in portrait. Grown-up items (progress file, notes, sources) sit in a collapsed "For grown-ups" section.

**iPad:** open the site in Safari → Share → *Add to Home Screen*. It then opens full-screen like an app. Progress is stored per browser, so keep using the same home-screen icon.

## Weekly plan

| Day | Activity |
|---|---|
| Monday | Programme Day A |
| Tuesday | Usual swimming session, about 1 hour |
| Wednesday | School sport — record the actual time |
| Thursday | Programme Day B |
| Friday | Programme Day C (or catch up on A/B) |
| Saturday | Something fun, or catch up on a programme day |
| Sunday | Optional gentle flow, or rest |

These are starter home sessions, not the whole day's activity target.

## 4-week programme

- **Week 1 – Learn the moves.** A: wall push-ups 2×6, chair squats 2×6, dead bugs 2×4/leg, knee plank 2×10 s. B: side leg lifts 2×6/side, stork stance 2×4/leg, glute bridges 2×8, bird dogs 2×4/side. C: Day A + 5-min Down Dog flow.
- **Week 2 – A little more.** A: 3×8, 3×8, 3×4/leg, 3×15 s. B: 3×8, 3×5, 3×10, 3×5/side. C: supported split squats 2×4/leg, wall sit 3×15 s, Down Dog flow.
- **Week 3 – Control.** A: slow wall push-ups 3×8, incline push-ups 2×5, chair squats 3×10. B: plank 3×10–20 s, dead bugs 3×6/leg, side plank on knees 2×10 s/side, superman hold 3×15 s. C: split squats 3×5/leg, step-ups 3×6/leg, wall sit 3×20 s.
- **Week 4 – Flow and celebrate.** A: pick 5 favourites, 2 rounds. B: stork stance, bird dogs, Down Dog flow, wall handstand-lean (adult present, feet on the floor). C: "Show what I can do" — Week 1 moves again.

Each workout card lists the exercises with set dots, and **Follow along step by step** walks through one exercise at a time with how-to steps, an easier option, a hold timer and a "Set done" button. The programme week advances each calendar week and can be changed with the 1–4 buttons.

## How progress works

- Every participation (done, adapted or partial) = **10 XP**, once per activity per date.
- Rest and Reschedule never cost anything; rest days are never shown as failures.
- Badges are personal and based on taking part. No streaks, leaderboards, weight, calories or appearance goals.
- Planned times start blank — set them on any card.
- Progress is stored in the browser's `localStorage` **on that device only**. It does not sync. Use **Export** / **Import** (JSON) to move it, and **Reset** (double confirmation) to clear it.


### Notes

- Progress on `github.io` is tied to that exact address. If you rename the repository, export first and import after.

## Sources

- Mark Lauren with Joshua Clark, *You Are Your Own Gym: The Bible of Bodyweight Exercises*, Ballantine Books, 2011, ISBN 978-0-345-52858-2 (adult book; used as a reference for bodyweight progressions — this plan uses child-friendly versions)
- Down Dog yoga app (optional for the flow): https://www.downdogapp.com/
- NHS — Physical activity guidelines for children and young people: https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-children-and-young-people/
- UK Chief Medical Officers' physical activity guidelines (2019): https://www.gov.uk/government/publications/physical-activity-guidelines-uk-chief-medical-officers-report
- WHO — Physical activity fact sheet: https://www.who.int/news-room/fact-sheets/detail/physical-activity

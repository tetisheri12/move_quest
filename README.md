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

## Publish on GitHub Pages

1. Sign in to GitHub and create a new repository, e.g. `move-quest` (Public, or Private on a paid plan).
2. Click **Add file → Upload files**, drag in `index.html`, `styles.css`, `app.js` and `README.md`, then **Commit changes**. Keep them at the top level of the repository, not inside a folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
5. Wait a minute or two and refresh. The address appears at the top of the Pages screen, usually `https://<your-username>.github.io/move-quest/`.
6. Open it on the child's device and bookmark it / add it to the home screen.

To update later, upload the changed file again and commit; Pages redeploys automatically.

### Notes

- Open the site through GitHub Pages (or any `http(s)://` address). Opening `index.html` directly from disk (`file://`) can stop YouTube embeds from playing — the "Open it on YouTube" link still works.
- Some school or family networks block YouTube embeds; the fallback link covers that.
- Progress on `github.io` is tied to that exact address. If you rename the repository, export first and import after.

## Sources

- The Body Coach TV — 5 Minute Move, Kids Workout 1: https://www.youtube.com/watch?v=d3LPrhI0v-w
- Nuffield Health — kids' workout: https://www.youtube.com/watch?v=aHVR2FnTpdk
- Nuffield Health — At-home workouts for kids: https://www.nuffieldhealth.com/article/at-home-workouts-for-kids
- NHS — Physical activity guidelines for children and young people: https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-children-and-young-people/
- UK Chief Medical Officers' physical activity guidelines (2019): https://www.gov.uk/government/publications/physical-activity-guidelines-uk-chief-medical-officers-report
- WHO — Physical activity fact sheet: https://www.who.int/news-room/fact-sheets/detail/physical-activity

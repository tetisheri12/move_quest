/* Move Quest — plain JavaScript, no dependencies, no build step.
   All progress lives in localStorage on this device only. */
(function () {
  'use strict';

  var STORE_KEY = 'moveQuest.v1';
  var XP_PER_SESSION = 10;
  var XP_PER_LEVEL = 50;

  /* ---------- Exercise library ---------- */
  // unit: 'reps' | 'sec' | 'min'. side: label used for "per leg" / "per side".
  var EX = {
    wallPush: {
      name: 'Wall push-up', needs: ['wall'],
      how: ['Stand an arm’s length from a wall, hands flat at shoulder height.', 'Keep your body straight like a plank.', 'Bend your elbows to bring your chest towards the wall, then push back.'],
      easier: 'Stand a little closer to the wall.'
    },
    slowWallPush: {
      name: 'Slow wall push-up', needs: ['wall'],
      how: ['Same as a wall push-up.', 'Count 1–2–3 on the way in, then push back at normal speed.'],
      easier: 'Count to 2 instead of 3.'
    },
    inclinePush: {
      name: 'Incline push-up', needs: ['sturdy sofa or table edge'], adultCheck: true,
      how: ['Ask an adult to check the sofa or table can’t slide or tip.', 'Hands on the edge, feet back, body straight.', 'Lower your chest towards the edge, then push away.'],
      easier: 'Go back to wall push-ups.'
    },
    chairSquat: {
      name: 'Chair squat', needs: ['sturdy chair'],
      how: ['Stand in front of a sturdy chair, feet hip-width apart.', 'Sit back slowly until you just touch the seat.', 'Stand up tall again, pushing through your whole foot.'],
      easier: 'Sit all the way down, then stand up.'
    },
    deadBug: {
      name: 'Dead bug', needs: ['mat'],
      how: ['Lie on your back, arms pointing at the ceiling, knees bent above your hips.', 'Keep your lower back gently pressed to the floor.', 'Slowly stretch one leg out, bring it back, then switch.'],
      easier: 'Keep the knee bent and just tap your heel down.'
    },
    kneePlank: {
      name: 'Plank on knees', needs: ['mat'],
      how: ['Forearms on the floor, elbows under shoulders, knees down.', 'Make a straight line from head to knees.', 'Breathe normally while you hold.'],
      easier: 'Hold for a shorter time.'
    },
    fullPlank: {
      name: 'Plank', needs: ['mat'],
      how: ['Forearms on the floor, elbows under shoulders.', 'Lift your knees so you’re on your toes, body in a straight line.', 'Stop the set if your hips sag or your back aches.'],
      easier: 'Drop your knees to the floor.'
    },
    sidePlankKnees: {
      name: 'Side plank on knees', needs: ['mat'],
      how: ['Lie on your side, propped on your forearm, knees bent behind you.', 'Lift your hips so your body is straight from head to knees.', 'Hold, then do the other side.'],
      easier: 'Hold for a shorter time.'
    },
    sideLegLift: {
      name: 'Side leg lift', needs: ['mat'],
      how: ['Lie on your side, head resting on your arm.', 'Lift your top leg slowly, toes pointing forward.', 'Lower it slowly. Do all reps, then switch sides.'],
      easier: 'Make the lift smaller.'
    },
    stork: {
      name: 'Stork stance', needs: ['wall'],
      how: ['Stand next to a wall.', 'Lift one foot and balance for a slow count of five.', 'Put it down, then do the other leg.'],
      easier: 'Rest one fingertip on the wall.'
    },
    bridge: {
      name: 'Glute bridge', needs: ['mat'],
      how: ['Lie on your back, knees bent, feet flat on the floor.', 'Squeeze your bottom and lift your hips.', 'Lower slowly.'],
      easier: 'Lift only halfway.'
    },
    birdDog: {
      name: 'Bird dog', needs: ['mat'],
      how: ['Start on hands and knees.', 'Reach one arm forward and the opposite leg back. Hold for two seconds.', 'Come back and switch sides.'],
      easier: 'Move only the leg, or only the arm.'
    },
    superman: {
      name: 'Superman hold', needs: ['mat'],
      how: ['Lie on your tummy, arms stretched forward.', 'Lift your arms and legs a little off the floor, eyes looking down.', 'Hold, then relax.'],
      easier: 'Lift only your arms, or only your legs.'
    },
    splitSquat: {
      name: 'Supported split squat', needs: ['sturdy chair'],
      how: ['Hold a chair back or the wall.', 'One foot forward, one foot back.', 'Bend both knees to lower straight down, then push up. Do all reps, then swap legs.'],
      easier: 'Make the dip smaller.'
    },
    wallSit: {
      name: 'Wall sit', needs: ['wall'],
      how: ['Back flat against a wall.', 'Slide down until your knees are bent — no lower than chair height.', 'Hold, then slide back up.'],
      easier: 'Don’t slide down as far.'
    },
    stepUp: {
      name: 'Step-up', needs: ['low stable step'], adultCheck: true,
      how: ['Use a low, stable step, such as the bottom stair with a handrail. Ask an adult to check it.', 'Step up with one foot, stand tall, step down.', 'Do all reps, then lead with the other foot.'],
      easier: 'Hold the handrail, or use a lower step.'
    },
    flow: {
      name: 'Down Dog beginner flow', needs: ['mat'],
      how: ['Child’s pose: 3 slow breaths.', 'Cat–cow on hands and knees × 5.', 'Downward dog with soft, bent knees: 3 breaths.', 'Low lunge, one side then the other.', 'Forward fold, then roll up slowly.', 'Or follow a 5-minute beginner session in the Down Dog app.'],
      easier: 'Stay in child’s pose longer.'
    },
    wallLean: {
      name: 'Wall handstand-lean', needs: ['wall'], adult: true,
      how: ['Only when an adult is with you.', 'Face the wall and reach your arms up, hands flat on the wall.', 'Lean in with a long, straight body — feet stay on the floor.', 'Hold, breathing slowly, then step back.'],
      easier: 'Lean in less.'
    }
  };

  function it(ex, sets, amount, unit, side) { return { ex: ex, sets: sets, amount: amount, unit: unit || 'reps', side: side || null }; }

  var DAY_A1 = [it('wallPush', 2, 6), it('chairSquat', 2, 6), it('deadBug', 2, 4, 'reps', 'leg'), it('kneePlank', 2, 10, 'sec')];
  var DAY_B1 = [it('sideLegLift', 2, 6, 'reps', 'side'), it('stork', 2, 4, 'reps', 'leg'), it('bridge', 2, 8), it('birdDog', 2, 4, 'reps', 'side')];

  var WEEKS = {
    1: {
      theme: 'Learn the moves',
      A: { title: 'Push & core', items: DAY_A1 },
      B: { title: 'Balance & back', items: DAY_B1 },
      C: { title: 'Day A again + Down Dog flow', items: DAY_A1.concat([it('flow', 1, 5, 'min')]) }
    },
    2: {
      theme: 'A little more',
      A: { title: 'Push & core', items: [it('wallPush', 3, 8), it('chairSquat', 3, 8), it('deadBug', 3, 4, 'reps', 'leg'), it('kneePlank', 3, 15, 'sec')] },
      B: { title: 'Balance & back', items: [it('sideLegLift', 3, 8, 'reps', 'side'), it('stork', 3, 5, 'reps', 'leg'), it('bridge', 3, 10), it('birdDog', 3, 5, 'reps', 'side')] },
      C: { title: 'Legs + Down Dog flow', items: [it('splitSquat', 2, 4, 'reps', 'leg'), it('wallSit', 3, 15, 'sec'), it('flow', 1, 5, 'min')] }
    },
    3: {
      theme: 'Control',
      A: { title: 'Slow pushes & squats', items: [it('slowWallPush', 3, 8), it('inclinePush', 2, 5), it('chairSquat', 3, 10)] },
      B: { title: 'Core strength', items: [it('fullPlank', 3, 15, 'sec'), it('deadBug', 3, 6, 'reps', 'leg'), it('sidePlankKnees', 2, 10, 'sec', 'side'), it('superman', 3, 15, 'sec')] },
      C: { title: 'Strong legs', items: [it('splitSquat', 3, 5, 'reps', 'leg'), it('stepUp', 3, 6, 'reps', 'leg'), it('wallSit', 3, 20, 'sec')] }
    },
    4: {
      theme: 'Flow and celebrate',
      A: { title: 'My favourite five', pick5: true, items: [] },
      B: { title: 'Balance & mobility', items: [it('stork', 2, 4, 'reps', 'leg'), it('birdDog', 2, 5, 'reps', 'side'), it('flow', 1, 5, 'min'), it('wallLean', 1, 10, 'sec')] },
      C: { title: 'Show what I can do', items: DAY_A1.concat(DAY_B1), showOff: true }
    }
  };
  // Week 3 plank is "10–20 sec": the timer uses 15, the label shows the range.
  WEEKS[3].B.items[0].label = '10–20 sec';

  var PICKABLE = ['wallPush', 'slowWallPush', 'inclinePush', 'chairSquat', 'splitSquat', 'wallSit', 'stepUp', 'deadBug', 'kneePlank', 'fullPlank', 'sidePlankKnees', 'sideLegLift', 'stork', 'bridge', 'birdDog', 'superman'];
  var PICK_AMOUNT = { sec: 15, reps: 8 };
  var TIMED = { kneePlank: 1, fullPlank: 1, sidePlankKnees: 1, superman: 1, wallSit: 1 };
  var SIDED = { deadBug: 'leg', sideLegLift: 'side', stork: 'leg', birdDog: 'side', splitSquat: 'leg', stepUp: 'leg', sidePlankKnees: 'side' };

  var GENTLE = { title: 'Gentle flow', items: [it('flow', 1, 5, 'min'), it('stork', 1, 3, 'reps', 'leg')] };

  var OTHER_IDEAS = {
    sat: ['Dance to your favourite songs', 'Bike or scooter ride', 'Football, tag or the playground', 'Cushion obstacle course'],
    sun: ['Gentle stretches', 'A walk outside', 'Slow dance to a calm song']
  };

  // weekday: 0 = Monday ... 6 = Sunday. options: A/B/C (programme days), flow, other
  var ACTIVITIES = {
    mon: { weekday: 0, kind: 'choice', options: ['A'] },
    tue: {
      weekday: 1, kind: 'session', name: 'Swimming',
      duration: 'About 60 min', minutes: 60,
      equipment: 'Swimsuit, goggles, towel, water bottle',
      note: 'Swimming day! No home workout.',
      steps: ['Swim with your coach.', 'Log how long you swam.'],
      easier: ['Rest at the wall when you need to.']
    },
    wed: {
      weekday: 2, kind: 'session', name: 'School sport',
      duration: 'Log the real time', minutes: null,
      equipment: 'PE kit, trainers, water bottle',
      note: 'School sport day! No home workout.',
      steps: ['Do sport at school.', 'Log how long it really lasted.'],
      easier: ['Ask the teacher for an easier version.']
    },
    thu: { weekday: 3, kind: 'choice', options: ['B'] },
    fri: { weekday: 4, kind: 'choice', options: ['C', 'A', 'B'] },
    sat: { weekday: 5, kind: 'choice', options: ['other', 'A', 'B', 'C'], otherDuration: 'As long as feels good', otherMinutes: 20, otherEquipment: 'Depends on the activity' },
    sun: { weekday: 6, kind: 'choice', options: ['flow', 'other'], optional: true, gentle: true, otherDuration: 'Optional — 10–20 min if you like', otherMinutes: 15, otherEquipment: 'Nothing needed' }
  };
  var ACT_BY_WEEKDAY = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var FEEDBACK = { easy: 'Easy', right: 'About right', hard: 'Too hard' };

  var BADGES = [
    { id: 'first', icon: '🚀', name: 'Lift-off', desc: 'Do your first session' },
    { id: 'part', icon: '🧩', name: 'Every Bit Counts', desc: 'Do part of a session' },
    { id: 'trio', icon: '🔺', name: 'A-B-C', desc: 'Day A, B and C in one week' },
    { id: 'flow', icon: '🧘', name: 'Flow Finder', desc: 'Do a Down Dog flow' },
    { id: 'splash', icon: '🌊', name: 'Splash', desc: 'Log a swim' },
    { id: 'team', icon: '🏅', name: 'Team Player', desc: 'Log school sport' },
    { id: 'explorer', icon: '🧭', name: 'Explorer', desc: 'Do your own activity' },
    { id: 'recharge', icon: '🌙', name: 'Recharge', desc: 'Take a rest day' },
    { id: 'voice', icon: '💬', name: 'Coach’s Ear', desc: 'Give feedback 3 times' },
    { id: 'flex', icon: '🔀', name: 'Flex Planner', desc: 'Finish a moved session' },
    { id: 'week3', icon: '⭐', name: 'Busy Week', desc: '3 sessions in one week' },
    { id: 'finisher', icon: '🏆', name: 'Show-Off Day', desc: 'Finish Week 4, Day C' }
  ];

  /* ---------- Dates (local time, YYYY-MM-DD) ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(s, n) { var d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function weekdayOf(s) { return (parseYmd(s).getDay() + 6) % 7; }
  function weekStartOf(s) { return addDays(s, -weekdayOf(s)); }
  function daysBetween(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }
  function todayStr() { return ymd(new Date()); }
  function fmtShort(s) { return parseYmd(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function fmtLong(s) { return parseYmd(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function fmtDateTime(local) {
    if (!local) return '';
    var d = new Date(local);
    if (isNaN(d)) return local;
    return d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  function nowLocalInput(dateStr) {
    var n = new Date();
    return (dateStr || ymd(n)) + 'T' + pad(n.getHours()) + ':' + pad(n.getMinutes());
  }

  /* ---------- State ---------- */

  function emptyState() {
    return { version: 2, programStart: weekStartOf(todayStr()), programWeeks: {}, plannedTimes: {}, entries: {}, choices: {}, otherText: {}, sets: {}, picks: {} };
  }

  var storageOk = true;
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return emptyState();
      return normalise(JSON.parse(raw)) || emptyState();
    } catch (e) {
      storageOk = false;
      return emptyState();
    }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageOk = true; }
    catch (e) { storageOk = false; }
    document.getElementById('storageWarning').hidden = storageOk;
  }
  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  function normalise(s) {
    if (!isObj(s) || !isObj(s.entries)) return null;
    var out = emptyState();
    ['programWeeks', 'plannedTimes', 'otherText', 'sets', 'picks'].forEach(function (k) { if (isObj(s[k])) out[k] = s[k]; });
    if (typeof s.programStart === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.programStart)) out.programStart = weekStartOf(s.programStart);
    // Only keep choices that are valid for this version (old video choices are dropped)
    if (isObj(s.choices)) {
      Object.keys(s.choices).forEach(function (k) {
        var act = ACTIVITIES[k.split('|')[1]];
        if (act && act.options && act.options.indexOf(s.choices[k]) !== -1) out.choices[k] = s.choices[k];
      });
    }
    Object.keys(s.entries).forEach(function (k) {
      var e = s.entries[k];
      if (isObj(e) && ACTIVITIES[e.act] && /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
          ['done', 'part', 'rest', 'rescheduled'].indexOf(e.status) !== -1) {
        out.entries[k] = e;
      }
    });
    return out;
  }

  var state = load();
  var view = { weekStart: weekStartOf(todayStr()), selected: todayStr() };
  var guide = {}; // cardKey -> current exercise index while following along

  /* ---------- Programme ---------- */

  function programWeekFor(date) {
    var ws = weekStartOf(date);
    var o = Number(state.programWeeks[ws]);
    if (o >= 1 && o <= 4) return o;
    var n = Math.floor(daysBetween(state.programStart, ws) / 7) + 1;
    return Math.max(1, Math.min(4, n));
  }

  function sessionItems(session, pweek, cardKey) {
    if (session === 'flow') return GENTLE.items;
    var s = WEEKS[pweek][session];
    if (!s.pick5) return s.items;
    var picks = (state.picks[cardKey] || []).filter(function (id) { return EX[id]; });
    return picks.map(function (id) {
      var u = TIMED[id] ? 'sec' : 'reps';
      return it(id, 2, PICK_AMOUNT[u], u, SIDED[id]);
    });
  }

  function amountLabel(i) {
    if (i.unit === 'min') return i.amount + ' min';
    var amt = i.label || (i.amount + (i.unit === 'sec' ? ' sec' : ''));
    return (i.sets > 1 ? i.sets + ' × ' : '') + amt + (i.side ? ' per ' + i.side : '');
  }

  function equipmentFor(items) {
    var set = {};
    items.forEach(function (i) { (EX[i.ex].needs || []).forEach(function (n) { set[n] = true; }); });
    var list = Object.keys(set);
    list.push('water');
    return list.join(' · ');
  }

  /* ---------- Derived values ---------- */

  function isParticipation(e) { return !!e && (e.status === 'done' || e.status === 'part'); }
  function allEntries() { return Object.keys(state.entries).map(function (k) { return state.entries[k]; }); }
  function totalXP() { return allEntries().filter(isParticipation).length * XP_PER_SESSION; }

  function cardsForDate(date) {
    var base = ACT_BY_WEEKDAY[weekdayOf(date)];
    var list = [{ key: date + '|' + base, date: date, act: base, movedFrom: null }];
    allEntries().forEach(function (e) {
      if (e.status === 'rescheduled' && e.to === date) {
        var key = date + '|' + e.act;
        if (!list.some(function (c) { return c.key === key; })) list.push({ key: key, date: date, act: e.act, movedFrom: e.date });
      }
    });
    return list;
  }

  function entriesOnDate(date) { return allEntries().filter(function (e) { return e.date === date; }); }

  function dayStatus(date) {
    var es = entriesOnDate(date);
    if (es.some(isParticipation)) return 'done';
    if (es.some(function (e) { return e.status === 'rest'; })) return 'rest';
    var today = todayStr();
    if (weekdayOf(date) === 6 && date <= today) return 'restday';
    if (es.some(function (e) { return e.status === 'rescheduled'; })) return 'moved';
    if (date === today) return 'today';
    if (date > today) return 'planned';
    return 'open';
  }

  function weekStats(start) {
    var end = addDays(start, 6);
    var sessions = 0, minutes = 0, rests = 0;
    allEntries().forEach(function (e) {
      if (e.date < start || e.date > end) return;
      if (isParticipation(e)) { sessions++; minutes += Number(e.minutes) || 0; }
      if (e.status === 'rest') rests++;
    });
    return { sessions: sessions, minutes: minutes, rests: rests, xp: sessions * XP_PER_SESSION };
  }

  function earnedBadges() {
    var es = allEntries();
    var part = es.filter(isParticipation);
    var perWeek = {}, abc = {};
    part.forEach(function (e) {
      var w = weekStartOf(e.date);
      perWeek[w] = (perWeek[w] || 0) + 1;
      if (e.session === 'A' || e.session === 'B' || e.session === 'C') { abc[w] = abc[w] || {}; abc[w][e.session] = true; }
    });
    return {
      first: part.length > 0,
      part: part.some(function (e) { return e.status === 'part'; }),
      trio: Object.keys(abc).some(function (w) { return abc[w].A && abc[w].B && abc[w].C; }),
      flow: part.some(function (e) { return e.session === 'flow' || (e.session === 'C' && (e.pweek === 1 || e.pweek === 2)) || (e.session === 'B' && e.pweek === 4); }),
      splash: part.some(function (e) { return e.act === 'tue'; }),
      team: part.some(function (e) { return e.act === 'wed'; }),
      explorer: part.some(function (e) { return e.session === 'other'; }),
      recharge: es.some(function (e) { return e.status === 'rest'; }),
      voice: es.filter(function (e) { return e.feedback; }).length >= 3,
      flex: part.some(function (e) { return e.movedFrom; }),
      week3: Object.keys(perWeek).some(function (w) { return perWeek[w] >= 3; }),
      finisher: part.some(function (e) { return e.session === 'C' && e.pweek === 4; })
    };
  }

  /* ---------- Helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  function choiceFor(card) {
    var a = ACTIVITIES[card.act];
    if (a.kind !== 'choice') return null;
    var c = state.choices[card.key];
    return a.options.indexOf(c) !== -1 ? c : a.options[0];
  }

  // What this card currently shows
  function resolve(card) {
    var a = ACTIVITIES[card.act];
    var choice = choiceFor(card);
    var pweek = programWeekFor(card.date);
    if (a.kind === 'session') {
      return { session: null, pweek: pweek, title: a.name, duration: a.duration, minutes: a.minutes, equipment: a.equipment, steps: a.steps, easier: a.easier, note: a.note };
    }
    if (choice === 'A' || choice === 'B' || choice === 'C') {
      var s = WEEKS[pweek][choice];
      var items = sessionItems(choice, pweek, card.key);
      var hasFlow = items.some(function (i) { return i.ex === 'flow'; });
      return {
        session: choice, pweek: pweek, workout: s, items: items,
        title: 'Day ' + choice + ': ' + s.title,
        duration: s.pick5 ? 'About 15 min' : (hasFlow ? 'About 15–20 min' : 'About 10–15 min'),
        minutes: hasFlow || s.pick5 ? 15 : 12,
        equipment: s.pick5 ? 'Depends on your picks · water' : equipmentFor(items)
      };
    }
    if (choice === 'flow') {
      return { session: 'flow', pweek: pweek, workout: GENTLE, items: GENTLE.items, title: 'Gentle flow (optional)', duration: 'About 10 min, optional', minutes: 10, equipment: equipmentFor(GENTLE.items) };
    }
    var ideas = OTHER_IDEAS[card.act] || [];
    return {
      session: 'other', pweek: pweek,
      title: a.gentle ? 'Gentle movement or rest' : 'Your own fun activity',
      duration: a.otherDuration, minutes: a.otherMinutes, equipment: a.otherEquipment,
      steps: ideas,
      easier: ['Shorter is fine.', 'Tired? Pick something calm.'],
      note: a.gentle ? 'Easy day. Rest is a great choice too.' : 'Your choice!'
    };
  }

  function choiceLabel(o, a) {
    if (o === 'other') return a.gentle ? 'Rest / my own' : 'Something else';
    if (o === 'flow') return 'Gentle flow';
    return 'Day ' + o;
  }

  /* ---------- Rendering ---------- */

  function renderPlayer() {
    var xp = totalXP();
    var level = Math.floor(xp / XP_PER_LEVEL) + 1;
    var into = xp % XP_PER_LEVEL;
    var pct = Math.round(into / XP_PER_LEVEL * 100);
    $('#player').innerHTML =
      '<div class="player-top"><span class="level">Level ' + level + '</span><span class="xp-total">' + xp + ' XP total</span></div>' +
      '<div class="bar" role="progressbar" aria-label="Progress to next level" aria-valuemin="0" aria-valuemax="' + XP_PER_LEVEL + '" aria-valuenow="' + into + '"><span style="width:' + pct + '%"></span></div>' +
      '<p class="bar-caption">' + (XP_PER_LEVEL - into) + ' XP to Level ' + (level + 1) + '</p>';
  }

  function renderWeek() {
    var start = view.weekStart;
    $('#weekLabel').textContent = parseYmd(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' – ' + parseYmd(addDays(start, 6)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    var today = todayStr();
    var icons = { done: '★', rest: '☾', restday: '☾', moved: '↷', today: '▶', planned: '•', open: '–' };
    var words = { done: 'took part', rest: 'rest day', restday: 'rest day', moved: 'moved', today: 'today', planned: 'coming up', open: 'not logged' };
    var html = '';
    for (var i = 0; i < 7; i++) {
      var d = addDays(start, i);
      var st = dayStatus(d);
      var cls = ['st-' + (st === 'restday' ? 'rest' : st)];
      if (d === view.selected) cls.push('is-selected');
      if (d === today) cls.push('is-today');
      html += '<li><button type="button" class="' + cls.join(' ') + '" data-action="select-day" data-date="' + d + '"' +
        (d === view.selected ? ' aria-current="date"' : '') +
        ' aria-label="' + esc(fmtLong(d) + ', ' + words[st]) + '">' +
        '<span class="d-name">' + DAY_SHORT[i] + '</span>' +
        '<span class="d-date">' + parseYmd(d).getDate() + '</span>' +
        '<span class="d-icon" aria-hidden="true">' + icons[st] + '</span></button></li>';
    }
    $('#strip').innerHTML = html;

    var pw = programWeekFor(start);
    $('#programWeek').innerHTML =
      '<span class="pw-label">Week</span>' +
      '<div class="pw-buttons" role="group" aria-label="Programme week for this calendar week">' +
      [1, 2, 3, 4].map(function (n) {
        return '<button type="button" class="btn small" data-action="set-pweek" data-week="' + n + '" aria-pressed="' + (n === pw) + '">' + n + '</button>';
      }).join('') + '</div>' +
      '<span class="pw-theme">' + esc(WEEKS[pw].theme) + '</span>';

    var s = weekStats(start);
    var txt = s.sessions === 0
      ? 'Each session = 10 XP'
      : '<strong>' + s.sessions + '</strong> session' + (s.sessions === 1 ? '' : 's') + ' · <strong>' + s.minutes + '</strong> min · <strong>' + s.xp + '</strong> XP this week';
    if (s.rests) txt += ' · ' + s.rests + ' rest day' + (s.rests === 1 ? '' : 's');
    $('#weekSummary').innerHTML = txt;
  }

  function renderDay() {
    var d = view.selected;
    var label = fmtLong(d);
    if (d === todayStr()) label = 'Today — ' + label;
    $('#dayTitle').textContent = label;
    $('#cards').innerHTML = cardsForDate(d).map(renderCard).join('');
  }

  function renderExerciseList(card, r) {
    var done = state.sets[card.key] || {};
    var picker = '';
    if (r.workout && r.workout.pick5) {
      var picks = state.picks[card.key] || [];
      picker = '<fieldset class="picker"><legend>Pick 5 favourites (' + picks.length + '/5)</legend><div class="pills">' +
        PICKABLE.map(function (id) {
          var on = picks.indexOf(id) !== -1;
          return '<label><input type="checkbox" data-field="pick" value="' + id + '"' + (on ? ' checked' : '') +
            (!on && picks.length >= 5 ? ' disabled' : '') + '><span>' + esc(EX[id].name) + '</span></label>';
        }).join('') + '</div><p class="hint">2 rounds of each.</p></fieldset>';
    }
    if (!r.items.length) return picker;
    var rows = r.items.map(function (i, idx) {
      var ex = EX[i.ex];
      var n = Math.min(done[idx] || 0, i.sets);
      var flags = (ex.adult ? '<span class="flag adult">Adult present only</span>' : '') + (ex.adultCheck ? '<span class="flag">Adult checks the setup</span>' : '');
      return '<li class="ex' + (n >= i.sets ? ' ex-done' : '') + '"><span class="ex-name">' + esc(ex.name) + '</span>' +
        '<span class="ex-amt">' + esc(amountLabel(i)) + '</span>' + flags +
        '<span class="ex-sets" aria-label="' + n + ' of ' + i.sets + ' sets done">' + dots(n, i.sets) + '</span></li>';
    }).join('');
    var intro = r.workout && r.workout.showOff
      ? '<p class="note">Week 1 moves again — see how easy they feel now!</p>' : '';
    return picker + intro + '<ol class="ex-list">' + rows + '</ol>';
  }

  function dots(n, total) {
    var s = '';
    for (var k = 0; k < total; k++) s += '<span class="dot' + (k < n ? ' on' : '') + '" aria-hidden="true"></span>';
    return s;
  }

  function renderGuide(card, r) {
    var items = r.items;
    if (!items.length) return '<div class="guide"><p>Pick your 5 exercises first.</p></div>';
    var idx = Math.min(guide[card.key] || 0, items.length);
    if (idx >= items.length) {
      return '<div class="guide finished"><p class="g-big">🎉 All done!</p><p>Press <strong>Done</strong> to get your XP.</p>' +
        '<div class="row"><button type="button" class="btn small ghost" data-action="g-prev">‹ Back</button></div></div>';
    }
    var i = items[idx];
    var ex = EX[i.ex];
    var n = (state.sets[card.key] || {})[idx] || 0;
    var setWord = i.unit === 'min' ? '' : 'Set ' + Math.min(n + 1, i.sets) + ' of ' + i.sets;
    var timer = (i.unit === 'sec' || i.unit === 'min')
      ? '<button type="button" class="btn timer" data-action="g-timer" data-sec="' + (i.unit === 'min' ? i.amount * 60 : i.amount) + '">⏱ Start ' + (i.unit === 'min' ? i.amount + ' min' : i.amount + ' sec') + ' timer</button>' : '';
    var adult = ex.adult ? '<p class="flag adult big">Only with an adult in the room. Feet stay on the floor.</p>' : '';
    return '<div class="guide" aria-live="polite">' +
      '<p class="g-count">Exercise ' + (idx + 1) + ' of ' + items.length + '</p>' +
      '<p class="g-big">' + esc(ex.name) + '</p>' +
      '<p class="g-amt">' + esc(amountLabel(i)) + (setWord ? ' · ' + setWord : '') + '</p>' + adult +
      '<ol class="g-how">' + ex.how.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ol>' +
      '<p class="g-easier"><strong>Easier:</strong> ' + esc(ex.easier) + '</p>' +
      '<p class="g-sets">' + dots(n, i.sets) + '</p>' +
      '<div class="row g-controls">' + timer +
      '<button type="button" class="btn primary" data-action="g-set"' + (n >= i.sets ? ' disabled' : '') + '>✔ ' + (i.unit === 'min' ? 'Finished' : 'Set done') + '</button>' +
      '<button type="button" class="btn ghost" data-action="g-skip">Skip</button></div>' +
      '<div class="row"><button type="button" class="btn small ghost" data-action="g-prev"' + (idx === 0 ? ' disabled' : '') + '>‹ Back</button>' +
      '<button type="button" class="btn small" data-action="g-next">Next exercise ›</button></div>' +
      '<p class="hint">Rest between sets. Pause any time.</p>' +
      '</div>';
  }

  function renderCard(card) {
    var a = ACTIVITIES[card.act];
    var e = state.entries[card.key];
    var wd = weekdayOf(card.date);
    var k = esc(card.key);
    var planned = state.plannedTimes[wd] || '';

    var head =
      '<div class="card-head"><div class="when">' + esc(DAY_NAMES[wd]) + ' · ' + esc(fmtShort(card.date)) + '</div>' +
      '<label class="planned">Time <input type="time" data-field="planned" data-weekday="' + wd + '" value="' + esc(planned) + '" aria-label="Planned time for ' + DAY_NAMES[wd] + 's"></label></div>';

    if (e && e.status === 'rescheduled') {
      var rr = resolve(card);
      return '<article class="card moved-out" data-key="' + k + '">' + head +
        '<h3>' + esc(rr.title) + '</h3>' +
        '<div class="logbox"><div class="result moved">↷ Moved to ' + esc(fmtShort(e.to)) + '</div>' +
        '<div class="row"><button type="button" class="btn small" data-action="goto" data-date="' + esc(e.to) + '">Go to ' + esc(fmtShort(e.to)) + '</button>' +
        '<button type="button" class="btn small ghost" data-action="undo">Undo move</button></div></div></article>';
    }

    var r = resolve(card);
    var tags = '<span class="tag">⏱ ' + esc(r.duration) + '</span><span class="tag">🎒 ' + esc(r.equipment) + '</span>';
    if (r.workout && r.session !== 'flow') tags += '<span class="tag week">Week ' + r.pweek + ' · ' + esc(WEEKS[r.pweek].theme) + '</span>';
    if (a.optional) tags += '<span class="tag opt">Optional</span>';
    if (card.movedFrom) tags += '<span class="tag moved">Moved from ' + esc(fmtShort(card.movedFrom)) + '</span>';

    var choices = '';
    if (a.kind === 'choice' && a.options.length > 1) {
      choices = '<div class="choices" role="group" aria-label="Choose what to do">' + a.options.map(function (o) {
        return '<button type="button" class="btn small" data-action="choose" data-choice="' + o + '" aria-pressed="' + (r.session === o) + '">' + esc(choiceLabel(o, a)) + '</button>';
      }).join('') + '</div>';
    }

    var body;
    if (r.workout) {
      var open = guide[card.key] !== undefined;
      body = renderExerciseList(card, r) +
        '<button type="button" class="btn watch" data-action="follow" aria-expanded="' + open + '">' +
        (open ? '✕ Close' : '▶ Start workout') + '</button>' +
        (open ? renderGuide(card, r) : '');
    } else {
      body = '<p class="no-video">' + esc(r.note) + '</p>';
      if (r.session === 'other') {
        body += '<label class="other-input">What will you do?<input type="text" maxlength="60" data-field="other" value="' + esc(state.otherText[card.key] || '') + '" placeholder="e.g. dancing, bike ride, stretching"></label>';
      }
      body += '<div class="how"><div><h4>What to do</h4><ol>' + r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
        '<div class="easier"><h4>Easier options</h4><ul>' + r.easier.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div></div>';
    }

    var status;
    var cardCls = 'card';
    if (e && isParticipation(e)) {
      cardCls += ' logged';
      status = logSummary(e);
    } else if (e && e.status === 'rest') {
      cardCls += ' rested';
      status = '<div class="logbox"><div class="result rest">☾ Rest day — recharging!</div>' +
        '<div class="row"><button type="button" class="btn small ghost" data-action="undo">Undo</button></div></div>';
    } else {
      status = '<div class="actions">' +
        '<button type="button" class="btn done" data-action="open-log" data-mode="done">✔ Done</button>' +
        '<button type="button" class="btn part" data-action="open-log" data-mode="part">½ Did part</button>' +
        '<button type="button" class="btn rest" data-action="rest">☾ Rest</button>' +
        '<button type="button" class="btn move" data-action="open-move">↷ Reschedule</button>' +
        '</div>' + moveForm();
    }

    return '<article class="' + cardCls + '" data-key="' + k + '">' + head +
      '<h3>' + esc(r.title) + '</h3><div class="tags">' + tags + '</div>' + choices + body + status + logForm(r) +
      '</article>';
  }

  function sessionLabel(e) {
    if (e.session === 'A' || e.session === 'B' || e.session === 'C') return 'Week ' + e.pweek + ', Day ' + e.session;
    if (e.session === 'flow') return 'Gentle flow';
    if (e.session === 'other') return e.other || 'Own activity';
    if (e.video === 'bodycoach') return 'Body Coach video';
    if (e.video === 'nuffield') return 'Nuffield Health video';
    return e.other || '';
  }

  function logSummary(e) {
    var label = e.status === 'done' ? '✔ Done' : '½ Did part';
    var what = sessionLabel(e);
    return '<div class="logbox"><div class="result ok">' + label + ' · +' + XP_PER_SESSION + ' XP</div><dl>' +
      (what ? '<dt>Activity</dt><dd>' + esc(what) + '</dd>' : '') +
      '<dt>Minutes</dt><dd>' + esc(e.minutes) + '</dd>' +
      '<dt>Finished</dt><dd>' + esc(fmtDateTime(e.completedAt)) + '</dd>' +
      (e.feedback ? '<dt>Felt</dt><dd>' + esc(FEEDBACK[e.feedback]) + '</dd>' : '') +
      '</dl><div class="row"><button type="button" class="btn small" data-action="edit">Edit</button>' +
      '<button type="button" class="btn small ghost" data-action="undo">Undo</button></div></div>';
  }

  function logForm(r) {
    var fb = ['', 'easy', 'right', 'hard'].map(function (v) {
      return '<label><input type="radio" name="feedback" value="' + v + '"' + (v === '' ? ' checked' : '') + '><span>' + (v ? FEEDBACK[v] : 'Skip') + '</span></label>';
    }).join('');
    return '<form class="form log-form" data-default-minutes="' + (r.minutes || '') + '" hidden>' +
      '<h4 class="form-title">Log it</h4>' +
      '<fieldset><legend>How much?</legend><div class="pills">' +
      '<label><input type="radio" name="status" value="done"><span>Done</span></label>' +
      '<label><input type="radio" name="status" value="part"><span>Did part</span></label></div></fieldset>' +
      '<label class="field">Minutes' +
      '<input type="number" name="minutes" min="1" max="300" inputmode="numeric" required></label>' +
      '<label class="field">Finished<input type="datetime-local" name="completedAt" required></label>' +
      '<fieldset><legend>How did it feel?</legend><div class="pills">' + fb + '</div></fieldset>' +
      '<div class="row"><button type="submit" class="btn primary">Save</button><button type="button" class="btn ghost" data-action="cancel">Cancel</button></div>' +
      '</form>';
  }

  function moveForm() {
    var today = todayStr();
    return '<form class="form move-form" hidden>' +
      '<h4>Move to which day?</h4>' +
      '<label class="field">Day' +
      '<input type="date" name="to" min="' + today + '" max="' + addDays(today, 14) + '" required></label>' +
      '<div class="row"><button type="submit" class="btn primary">Move it</button><button type="button" class="btn ghost" data-action="cancel">Cancel</button></div>' +
      '</form>';
  }

  function renderBadges() {
    var got = earnedBadges();
    $('#badges').innerHTML = BADGES.map(function (b) {
      var on = got[b.id];
      return '<div class="badge ' + (on ? 'earned' : 'locked') + '"><span class="b-icon" aria-hidden="true">' + b.icon + '</span>' +
        '<span class="b-name">' + esc(b.name) + '</span><span class="b-desc">' + esc(b.desc) + '</span>' +
        (on ? '<span class="b-state">Earned!</span>' : '') + '</div>';
    }).join('');
  }

  function render() {
    stopTimer();
    renderPlayer();
    renderWeek();
    renderDay();
    renderBadges();
    document.getElementById('storageWarning').hidden = storageOk;
  }

  /* ---------- Timer ---------- */

  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer.id); timer = null; } }
  function startTimer(btn, sec) {
    if (timer && timer.btn === btn) { stopTimer(); btn.textContent = '⏱ Start again'; return; }
    stopTimer();
    var left = sec;
    function show() { btn.textContent = '⏸ ' + (left >= 60 ? Math.floor(left / 60) + ':' + pad(left % 60) : left + ' s') + ' — tap to stop'; }
    show();
    timer = {
      btn: btn,
      id: setInterval(function () {
        left--;
        if (left <= 0) {
          stopTimer();
          btn.textContent = '✅ Time! Tap “Set done”';
          if (navigator.vibrate) { try { navigator.vibrate(200); } catch (e) { /* ignore */ } }
          return;
        }
        show();
      }, 1000)
    };
  }

  /* ---------- Actions ---------- */

  function cardFromEl(el) {
    var art = el.closest('article.card');
    if (!art) return null;
    var key = art.getAttribute('data-key');
    return cardsForDate(view.selected).filter(function (c) { return c.key === key; })[0] || null;
  }

  function rerenderCard(card) {
    stopTimer();
    var art = document.querySelector('article.card[data-key="' + cssEsc(card.key) + '"]');
    if (!art) return renderDay();
    var tmp = document.createElement('div');
    tmp.innerHTML = renderCard(card);
    art.replaceWith(tmp.firstChild);
  }
  function cssEsc(s) { return window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/"/g, '\\"'); }

  function hideForms(art) { art.querySelectorAll('form').forEach(function (f) { f.hidden = true; }); }

  function openLog(art, card, mode, existing) {
    hideForms(art);
    var f = art.querySelector('.log-form');
    f.querySelectorAll('input[name="status"]').forEach(function (r) { r.checked = r.value === mode; });
    f.querySelector('.form-title').textContent = existing ? 'Edit' : mode === 'done' ? 'Nice work!' : 'Every bit counts!';
    var min = f.elements.minutes;
    var when = f.elements.completedAt;
    if (existing) {
      min.value = existing.minutes || '';
      when.value = existing.completedAt || nowLocalInput(card.date);
      var fbv = existing.feedback || '';
      f.querySelectorAll('input[name="feedback"]').forEach(function (r) { r.checked = r.value === fbv; });
    } else {
      min.value = mode === 'done' ? (f.getAttribute('data-default-minutes') || '') : '';
      when.value = nowLocalInput(card.date);
    }
    f.hidden = false;
    min.focus();
  }

  function saveLog(form, card) {
    var stEl = form.querySelector('input[name="status"]:checked');
    var mode = stEl ? stEl.value : 'done';
    var minutes = parseInt(form.elements.minutes.value, 10);
    if (!(minutes >= 1 && minutes <= 300)) { toast('Please enter minutes between 1 and 300.'); return; }
    var completedAt = form.elements.completedAt.value;
    if (!completedAt) { toast('Please add when you finished.'); return; }
    var fbEl = form.querySelector('input[name="feedback"]:checked');
    var r = resolve(card);
    var prev = state.entries[card.key];
    var wasCounted = isParticipation(prev);
    var entry = {
      date: card.date, act: card.act, status: mode, minutes: minutes, completedAt: completedAt,
      feedback: fbEl && fbEl.value ? fbEl.value : null,
      session: r.session, pweek: r.session ? r.pweek : null,
      other: r.session === 'other' ? (state.otherText[card.key] || 'Own activity') : null,
      movedFrom: card.movedFrom || (prev && prev.movedFrom) || null
    };
    if (wasCounted && prev) { // editing keeps what was originally logged
      ['session', 'pweek', 'other', 'video'].forEach(function (f) { if (prev[f] !== undefined) entry[f] = prev[f]; });
    }
    var before = earnedBadges();
    state.entries[card.key] = entry;
    save();
    var after = earnedBadges();
    var newBadge = BADGES.filter(function (b) { return after[b.id] && !before[b.id]; })[0];
    delete guide[card.key];
    render();
    if (wasCounted) toast('Updated.');
    else if (newBadge) toast('+10 XP — new badge: ' + newBadge.name + '!');
    else toast(mode === 'done' ? '+10 XP — great work!' : '+10 XP — every bit counts!');
  }

  function saveMove(form, card) {
    var to = form.elements.to.value;
    if (!to) { toast('Pick a day.'); return; }
    if (to === card.date) { toast('That’s the same day — pick another.'); return; }
    if (ACT_BY_WEEKDAY[weekdayOf(to)] === card.act || state.entries[to + '|' + card.act]) { toast('That day already has this activity — pick another.'); return; }
    // carry the chosen option (e.g. Day A) to the new day
    var ch = state.choices[card.key];
    if (ch) state.choices[to + '|' + card.act] = ch;
    state.entries[card.key] = { date: card.date, act: card.act, status: 'rescheduled', to: to, movedFrom: card.movedFrom || null };
    save();
    render();
    toast('Moved to ' + fmtShort(to) + '.');
  }

  function undo(card) {
    var e = state.entries[card.key];
    if (!e) return;
    if (e.status === 'rescheduled' && state.entries[e.to + '|' + card.act]) { toast('Undo the session on ' + fmtShort(e.to) + ' first.'); return; }
    if (isParticipation(e) && !confirm('Undo this session? Its 10 XP will be removed.')) return;
    delete state.entries[card.key];
    save();
    render();
    toast('Undone.');
  }

  function exportData() {
    var payload = { app: 'move-quest', version: 2, exportedAt: new Date().toISOString(), data: state };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'move-quest-progress-' + todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Progress file downloaded.');
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var parsed, data;
      try {
        parsed = JSON.parse(reader.result);
        data = normalise(parsed && parsed.data ? parsed.data : parsed);
      } catch (e) { data = null; }
      if (!data) { alert('That file doesn’t look like a Move Quest progress file.'); return; }
      var n = Object.keys(data.entries).length;
      if (!confirm('Replace the progress on this device with the imported file (' + n + ' log entries)?')) return;
      state = data;
      save();
      render();
      toast('Progress imported.');
    };
    reader.onerror = function () { alert('Could not read that file.'); };
    reader.readAsText(file, 'utf-8');
  }

  function resetAll() {
    if (!confirm('Reset everything? This deletes all logged sessions, XP, badges, planned times and programme progress on this device. Export first if you want a backup.')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    state = emptyState();
    guide = {};
    save();
    render();
    toast('Everything reset.');
  }

  function selectDate(d) {
    view.selected = d;
    view.weekStart = weekStartOf(d);
    render();
  }

  function setsFor(card) { return state.sets[card.key] || (state.sets[card.key] = {}); }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    var action = btn.getAttribute('data-action');
    var art = btn.closest('article.card');
    var card = art ? cardFromEl(btn) : null;
    var r, idx;

    switch (action) {
      case 'prev-week': view.weekStart = addDays(view.weekStart, -7); view.selected = view.weekStart; render(); break;
      case 'next-week': view.weekStart = addDays(view.weekStart, 7); view.selected = view.weekStart; render(); break;
      case 'go-today': selectDate(todayStr()); break;
      case 'select-day': selectDate(btn.getAttribute('data-date')); break;
      case 'goto': selectDate(btn.getAttribute('data-date')); document.getElementById('day').focus(); break;
      case 'set-pweek':
        state.programWeeks[view.weekStart] = Number(btn.getAttribute('data-week'));
        save(); render(); toast('This week uses programme Week ' + btn.getAttribute('data-week') + '.');
        break;
      case 'choose':
        if (card) { state.choices[card.key] = btn.getAttribute('data-choice'); delete guide[card.key]; save(); rerenderCard(card); }
        break;
      case 'follow':
        if (card) {
          if (guide[card.key] === undefined) guide[card.key] = 0; else delete guide[card.key];
          rerenderCard(card);
          var g = document.querySelector('article.card[data-key="' + cssEsc(card.key) + '"] .guide');
          if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      case 'g-timer': startTimer(btn, Number(btn.getAttribute('data-sec'))); break;
      case 'g-set':
        if (card) {
          r = resolve(card); idx = guide[card.key] || 0;
          var item = r.items[idx];
          var s = setsFor(card);
          s[idx] = Math.min((s[idx] || 0) + 1, item.sets);
          if (s[idx] >= item.sets) guide[card.key] = idx + 1;
          save(); rerenderCard(card);
        }
        break;
      case 'g-skip':
      case 'g-next':
        if (card) { r = resolve(card); guide[card.key] = Math.min((guide[card.key] || 0) + 1, r.items.length); rerenderCard(card); }
        break;
      case 'g-prev':
        if (card) { guide[card.key] = Math.max((guide[card.key] || 0) - 1, 0); rerenderCard(card); }
        break;
      case 'open-log': if (card) openLog(art, card, btn.getAttribute('data-mode')); break;
      case 'edit':
        if (card && state.entries[card.key]) openLog(art, card, state.entries[card.key].status, state.entries[card.key]);
        break;
      case 'open-move':
        if (art) { hideForms(art); var mf = art.querySelector('.move-form'); mf.hidden = false; mf.elements.to.focus(); }
        break;
      case 'cancel': if (art) hideForms(art); break;
      case 'rest':
        if (card) {
          state.entries[card.key] = { date: card.date, act: card.act, status: 'rest', movedFrom: card.movedFrom || null, completedAt: nowLocalInput(card.date) };
          delete guide[card.key];
          save(); render(); toast('Rest logged — recharging counts.');
        }
        break;
      case 'undo': if (card) undo(card); break;
      case 'export': exportData(); break;
      case 'reset': resetAll(); break;
    }
  });

  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    var card = cardFromEl(form);
    if (!card) return;
    ev.preventDefault();
    if (form.classList.contains('log-form')) saveLog(form, card);
    else if (form.classList.contains('move-form')) saveMove(form, card);
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.matches('input[data-field="planned"]')) {
      var wd = el.getAttribute('data-weekday');
      if (el.value) state.plannedTimes[wd] = el.value; else delete state.plannedTimes[wd];
      save();
      toast(el.value ? DAY_NAMES[wd] + 's planned for ' + el.value + '.' : 'Planned time cleared.');
    } else if (el.matches('input[data-field="pick"]')) {
      var card = cardFromEl(el);
      if (!card) return;
      var picks = (state.picks[card.key] || []).filter(function (id) { return id !== el.value; });
      if (el.checked && picks.length < 5) picks.push(el.value);
      state.picks[card.key] = picks;
      state.sets[card.key] = {};
      save(); rerenderCard(card);
    } else if (el.id === 'importFile' && el.files && el.files[0]) {
      importData(el.files[0]);
      el.value = '';
    }
  });

  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.matches('input[data-field="other"]')) {
      var card = cardFromEl(el);
      if (card) { state.otherText[card.key] = el.value.slice(0, 60); save(); }
    }
  });

  // Keep "today" correct if the page stays open past midnight
  var lastToday = todayStr();
  setInterval(function () {
    var t = todayStr();
    if (t !== lastToday) {
      if (view.selected === lastToday) { view.selected = t; view.weekStart = weekStartOf(t); }
      lastToday = t;
      if (!timer) render();
    }
  }, 60000);

  // lets :active button styles show on iPad/iPhone taps
  document.addEventListener('touchstart', function () {}, { passive: true });

  save(); // stores programStart on first visit
  render();
})();

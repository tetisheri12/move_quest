/* Move Quest — plain JavaScript, no dependencies, no build step.
   All progress lives in localStorage on this device only. */
(function () {
  'use strict';

  var STORE_KEY = 'moveQuest.v1';
  var XP_PER_SESSION = 10;
  var XP_PER_LEVEL = 50;

  /* ---------- Content ---------- */

  var VIDEOS = {
    bodycoach: {
      id: 'd3LPrhI0v-w',
      label: 'Body Coach',
      title: 'Body Coach: 5 Minute Move',
      channel: 'The Body Coach TV (Joe Wicks)',
      duration: 'About 6 min (5:49 video)',
      minutes: 6,
      equipment: 'No equipment · space to jump · water',
      steps: [
        'Clear a space about two big steps wide.',
        'Press "Watch and follow".',
        'Copy each move for 40 seconds, then rest for 20 when Joe rests.',
        'Moves: marching, star jumps, low sprint shuffle, squats, climb the rope.',
        'Come back here and press Done or Did part.'
      ],
      easier: [
        'Star jumps → step one foot out at a time, arms up.',
        'Sprint shuffle → quick feet standing tall, or fast marching.',
        'Squats → sit down onto a chair and stand back up.',
        'Climb the rope → arms only, feet still.',
        'Need a breather? Pause the video. Restart when ready.'
      ]
    },
    nuffield: {
      id: 'aHVR2FnTpdk',
      label: 'Nuffield Health',
      title: 'Nuffield Health kids\u2019 workout',
      channel: 'Nuffield Health',
      duration: 'About 15\u201320 min with pauses',
      minutes: 15,
      equipment: 'No equipment · mat or carpet · water',
      steps: [
        'Clear a space and put a mat or towel on a non-slip floor.',
        'Press "Watch and follow".',
        'Watch each new move once before you try it.',
        'Pause the video between moves whenever you like.',
        'Come back here and press Done or Did part.'
      ],
      easier: [
        'Step instead of jumping.',
        'Make moves smaller and slower.',
        'Hold a wall or chair back for balance.',
        'Skip a move that feels wrong \u2014 march on the spot instead.',
        'If the video uses any equipment, do the no-equipment version.'
      ]
    }
  };

  var OTHER_IDEAS = {
    sat: ['Dance to a few favourite songs', 'Bike ride or scooter with an adult', 'Football, tag or the playground', 'Obstacle course with cushions on the floor'],
    sun: ['Gentle stretches', 'A walk outside with family', 'Slow dance to a calm song', 'Or simply rest \u2014 that counts too']
  };

  // weekday: 0 = Monday ... 6 = Sunday
  var ACTIVITIES = {
    mon: {
      weekday: 0, kind: 'video', video: 'bodycoach', bonusRound: true,
      name: 'Body Coach: 5 Minute Move',
      extraTag: 'Optional 2nd round'
    },
    tue: {
      weekday: 1, kind: 'session', name: 'Swimming',
      duration: 'About 60 min', minutes: 60,
      equipment: 'Swimsuit, goggles, towel, water bottle',
      noVideo: 'No video today \u2014 this is your usual swimming session.',
      steps: ['Go to your usual swimming session.', 'Follow your coach or teacher.', 'Afterwards, log the real time you swam.'],
      easier: ['Rest at the wall whenever you need to.', 'Tell the coach if anything hurts.', 'Did a shorter swim? Press Did part.']
    },
    wed: {
      weekday: 2, kind: 'session', name: 'School sport',
      duration: 'Varies \u2014 record the actual time', minutes: null,
      equipment: 'PE kit, trainers, water bottle',
      noVideo: 'No video today \u2014 this is your school sport session.',
      steps: ['Take part in sport at school.', 'When you get home, write down how long it really lasted.', 'Press Done (or Did part if you sat some out).'],
      easier: ['Ask the teacher for an easier version.', 'Take water breaks.', 'Tell the teacher if anything hurts.']
    },
    thu: {
      weekday: 3, kind: 'video', video: 'nuffield',
      name: 'Nuffield Health workout',
      extraTag: 'Pauses welcome'
    },
    fri: {
      weekday: 4, kind: 'choice', options: ['bodycoach', 'nuffield'],
      name: 'Your choice: pick a video'
    },
    sat: {
      weekday: 5, kind: 'choice', options: ['bodycoach', 'nuffield', 'other'],
      name: 'Your choice: a video or something fun',
      otherDuration: 'As long as feels good', otherMinutes: 20,
      otherEquipment: 'Depends on the activity'
    },
    sun: {
      weekday: 6, kind: 'choice', options: ['other', 'nuffield', 'bodycoach'], optional: true, gentle: true,
      name: 'Gentle movement or rest',
      otherDuration: 'Optional \u2014 10\u201320 min if you like', otherMinutes: 15,
      otherEquipment: 'Nothing needed'
    }
  };
  var ACT_BY_WEEKDAY = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var FEEDBACK = { easy: 'Easy', right: 'About right', hard: 'Too hard' };

  var BADGES = [
    { id: 'first', icon: '\uD83D\uDE80', name: 'Lift-off', desc: 'Take part in your first session' },
    { id: 'part', icon: '\uD83E\uDDE9', name: 'Every Bit Counts', desc: 'Log a "Did part" session' },
    { id: 'bonus', icon: '\uD83D\uDD01', name: 'Bonus Round', desc: 'Do a second Body Coach round' },
    { id: 'both', icon: '\uD83C\uDFAC', name: 'Two Coaches', desc: 'Try both workout videos' },
    { id: 'splash', icon: '\uD83C\uDF0A', name: 'Splash', desc: 'Log a swimming session' },
    { id: 'team', icon: '\uD83C\uDFC5', name: 'Team Player', desc: 'Log school sport' },
    { id: 'explorer', icon: '\uD83E\uDDED', name: 'Explorer', desc: 'Log your own fun activity' },
    { id: 'recharge', icon: '\uD83C\uDF19', name: 'Recharge', desc: 'Log a rest day \u2014 rest is part of training' },
    { id: 'voice', icon: '\uD83D\uDCAC', name: 'Coach\u2019s Ear', desc: 'Give feedback 3 times' },
    { id: 'flex', icon: '\uD83D\uDD00', name: 'Flex Planner', desc: 'Finish a rescheduled session' },
    { id: 'week3', icon: '\u2B50', name: 'Busy Week', desc: 'Take part 3 times in one week' },
    { id: 'xp100', icon: '\uD83D\uDC8E', name: '100 XP', desc: 'Reach 100 XP' }
  ];

  /* ---------- Dates (local time, YYYY-MM-DD) ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(s, n) { var d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function weekdayOf(s) { return (parseYmd(s).getDay() + 6) % 7; }
  function weekStartOf(s) { return addDays(s, -weekdayOf(s)); }
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
    var time = pad(n.getHours()) + ':' + pad(n.getMinutes());
    return (dateStr || ymd(n)) + 'T' + time;
  }

  /* ---------- State ---------- */

  function emptyState() {
    return { version: 1, plannedTimes: {}, entries: {}, choices: {}, otherText: {} };
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
    out.plannedTimes = isObj(s.plannedTimes) ? s.plannedTimes : {};
    out.choices = isObj(s.choices) ? s.choices : {};
    out.otherText = isObj(s.otherText) ? s.otherText : {};
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
        if (!list.some(function (c) { return c.key === key; })) {
          list.push({ key: key, date: date, act: e.act, movedFrom: e.date });
        }
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
    var videos = {};
    part.forEach(function (e) { if (e.video) videos[e.video] = true; });
    var perWeek = {};
    part.forEach(function (e) { var w = weekStartOf(e.date); perWeek[w] = (perWeek[w] || 0) + 1; });
    var got = {
      first: part.length > 0,
      part: part.some(function (e) { return e.status === 'part'; }),
      bonus: part.some(function (e) { return e.secondRound; }),
      both: !!(videos.bodycoach && videos.nuffield),
      splash: part.some(function (e) { return e.act === 'tue'; }),
      team: part.some(function (e) { return e.act === 'wed'; }),
      explorer: part.some(function (e) { return e.video === 'other'; }),
      recharge: es.some(function (e) { return e.status === 'rest'; }),
      voice: es.filter(function (e) { return e.feedback; }).length >= 3,
      flex: part.some(function (e) { return e.movedFrom; }),
      week3: Object.keys(perWeek).some(function (w) { return perWeek[w] >= 3; }),
      xp100: totalXP() >= 100
    };
    return got;
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
    if (a.kind !== 'choice') return a.kind === 'video' ? a.video : null;
    var c = state.choices[card.key];
    return a.options.indexOf(c) !== -1 ? c : a.options[0];
  }

  // Resolve what this card currently shows (video or not, duration, equipment, steps)
  function resolve(card) {
    var a = ACTIVITIES[card.act];
    var choice = choiceFor(card);
    var v = choice && VIDEOS[choice] ? VIDEOS[choice] : null;
    if (v) {
      return {
        choice: choice, video: v,
        duration: a.gentle ? 'Optional \u2014 go slowly, stop any time' : v.duration,
        minutes: v.minutes, equipment: v.equipment,
        steps: v.steps,
        easier: a.gentle ? ['Go at half speed \u2014 that\u2019s the goal today.'].concat(v.easier) : v.easier
      };
    }
    if (a.kind === 'session') {
      return { choice: null, video: null, duration: a.duration, minutes: a.minutes, equipment: a.equipment, steps: a.steps, easier: a.easier, noVideo: a.noVideo };
    }
    // 'other' activity on Saturday / Sunday
    var ideas = OTHER_IDEAS[card.act] || [];
    return {
      choice: 'other', video: null, duration: a.otherDuration, minutes: a.otherMinutes, equipment: a.otherEquipment,
      steps: ['Pick something you enjoy and write it below.', 'Ideas: ' + ideas.join(' · ') + '.', 'Press Done, Did part or Rest when you\u2019re finished.'],
      easier: ['Shorter is fine.', 'Choose something calm if you\u2019re tired.', 'Ask an adult before trying anything new.'],
      noVideo: a.gentle ? 'Today is easy-going. Rest is a perfectly good choice.' : 'No video needed for your own activity.'
    };
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
      '<p class="bar-caption">' + (XP_PER_LEVEL - into) + ' XP to Level ' + (level + 1) + ' · 10 XP for every session you take part in</p>';
  }

  function renderWeek() {
    var start = view.weekStart;
    $('#weekLabel').textContent = parseYmd(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' \u2013 ' + parseYmd(addDays(start, 6)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    var today = todayStr();
    var icons = { done: '\u2605', rest: '\u263E', restday: '\u263E', moved: '\u21B7', today: '\u25B6', planned: '\u2022', open: '\u2013' };
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

    var s = weekStats(start);
    var txt = s.sessions === 0
      ? 'No sessions logged this week yet \u2014 every session you take part in earns 10 XP.'
      : '<strong>' + s.sessions + '</strong> session' + (s.sessions === 1 ? '' : 's') + ' · <strong>' + s.minutes + '</strong> min · <strong>' + s.xp + '</strong> XP this week';
    if (s.rests) txt += ' · ' + s.rests + ' rest day' + (s.rests === 1 ? '' : 's');
    $('#weekSummary').innerHTML = txt;
  }

  function renderDay() {
    var d = view.selected;
    var label = fmtLong(d);
    if (d === todayStr()) label = 'Today \u2014 ' + label;
    $('#dayTitle').textContent = label;
    $('#cards').innerHTML = cardsForDate(d).map(renderCard).join('');
  }

  function renderCard(card) {
    var a = ACTIVITIES[card.act];
    var e = state.entries[card.key];
    var wd = weekdayOf(card.date);
    var k = esc(card.key);
    var planned = state.plannedTimes[wd] || '';

    var head =
      '<div class="card-head"><div><div class="when">' + esc(DAY_NAMES[wd]) + ' · ' + esc(fmtShort(card.date)) + '</div></div>' +
      '<label class="planned">Planned time <input type="time" data-field="planned" data-weekday="' + wd + '" value="' + esc(planned) + '" aria-label="Planned time for ' + DAY_NAMES[wd] + 's"></label></div>';

    // Moved away from this date
    if (e && e.status === 'rescheduled') {
      return '<article class="card moved-out" data-key="' + k + '">' + head +
        '<h3>' + esc(a.name) + '</h3>' +
        '<div class="logbox"><div class="result moved">\u21B7 Moved to ' + esc(fmtShort(e.to)) + '</div>' +
        '<p class="muted">Nothing missed \u2014 it\u2019s waiting on the new day.</p>' +
        '<div class="row"><button type="button" class="btn small" data-action="goto" data-date="' + esc(e.to) + '">Go to ' + esc(fmtShort(e.to)) + '</button>' +
        '<button type="button" class="btn small ghost" data-action="undo">Undo move</button></div></div></article>';
    }

    var r = resolve(card);
    var tags = '<span class="tag">\u23F1 ' + esc(r.duration) + '</span><span class="tag">\uD83C\uDF92 ' + esc(r.equipment) + '</span>';
    if (a.extraTag) tags += '<span class="tag">' + esc(a.extraTag) + '</span>';
    if (a.optional) tags += '<span class="tag opt">Optional</span>';
    if (card.movedFrom) tags += '<span class="tag moved">Moved from ' + esc(fmtShort(card.movedFrom)) + '</span>';

    var choices = '';
    if (a.kind === 'choice') {
      choices = '<div class="choices" role="group" aria-label="Choose an activity">' + a.options.map(function (o) {
        var lbl = o === 'other' ? (a.gentle ? 'Gentle / my own' : 'Something else') : VIDEOS[o].label;
        return '<button type="button" class="btn small" data-action="choose" data-choice="' + o + '" aria-pressed="' + (r.choice === o) + '">' + esc(lbl) + '</button>';
      }).join('') + '</div>';
    }

    var title = a.kind === 'choice' && r.video ? r.video.title : a.name;
    if (a.kind === 'choice' && !r.video) title = a.gentle ? 'Gentle movement or rest' : 'Your own fun activity';

    var media;
    if (r.video) {
      var v = r.video;
      media = '<div class="video-box">' +
        '<button type="button" class="btn watch" data-action="watch" aria-expanded="false">\u25B6 Watch and follow</button>' +
        '<div class="video-frame" data-video="' + esc(v.id) + '" data-title="' + esc(v.title) + '" hidden></div>' +
        '<a class="fallback" href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">Video not playing? Open it on YouTube \u2197</a>' +
        '</div>';
    } else {
      media = '<p class="no-video">' + esc(r.noVideo) + '</p>';
      if (r.choice === 'other') {
        media += '<label class="other-input">What will you do?<input type="text" maxlength="60" data-field="other" value="' + esc(state.otherText[card.key] || '') + '" placeholder="e.g. dancing, bike ride, stretching"></label>';
      }
    }

    var how = '<div class="how"><div><h4>How to do it</h4><ol>' + r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="easier"><h4>Easier options</h4><ul>' + r.easier.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div></div>' +
      '<p class="mini-safety">Pause whenever you need. Stop and tell an adult if anything hurts or you feel dizzy or unwell.</p>';

    var status;
    var cardCls = 'card';
    if (e && isParticipation(e)) {
      cardCls += ' logged';
      status = logSummary(e);
    } else if (e && e.status === 'rest') {
      cardCls += ' rested';
      status = '<div class="logbox"><div class="result rest">\u263E Rest day</div><p>Resting helps your body get stronger. Nice choice.</p>' +
        '<div class="row"><button type="button" class="btn small ghost" data-action="undo">Undo</button></div></div>';
    } else {
      status = '<div class="actions">' +
        '<button type="button" class="btn done" data-action="open-log" data-mode="done">\u2714 Done</button>' +
        '<button type="button" class="btn part" data-action="open-log" data-mode="part">\u25D1 Did part</button>' +
        '<button type="button" class="btn rest" data-action="rest">\u263E Rest</button>' +
        '<button type="button" class="btn move" data-action="open-move">\u21B7 Reschedule</button>' +
        '</div>' + moveForm(card);
    }

    return '<article class="' + cardCls + '" data-key="' + k + '">' + head +
      '<h3>' + esc(title) + '</h3><div class="tags">' + tags + '</div>' + choices + media + how + status + logForm(card, r) +
      '</article>';
  }

  function logSummary(e) {
    var label = e.status === 'done' ? '\u2714 Done' : '\u25D1 Did part';
    var what = e.video && VIDEOS[e.video] ? VIDEOS[e.video].label + ' video' : (e.other ? e.other : '');
    return '<div class="logbox"><div class="result ok">' + label + ' \u00B7 +' + XP_PER_SESSION + ' XP</div><dl>' +
      (what ? '<dt>Activity</dt><dd>' + esc(what) + '</dd>' : '') +
      '<dt>Minutes</dt><dd>' + esc(e.minutes) + (e.secondRound ? ' (incl. 2nd round)' : '') + '</dd>' +
      '<dt>Finished</dt><dd>' + esc(fmtDateTime(e.completedAt)) + '</dd>' +
      (e.feedback ? '<dt>Felt</dt><dd>' + esc(FEEDBACK[e.feedback]) + '</dd>' : '') +
      '</dl><div class="row"><button type="button" class="btn small" data-action="edit">Edit</button>' +
      '<button type="button" class="btn small ghost" data-action="undo">Undo</button></div></div>';
  }

  function logForm(card, r) {
    var a = ACTIVITIES[card.act];
    var bonus = a.bonusRound
      ? '<label class="check"><input type="checkbox" name="secondRound"> I did the optional second round</label>' : '';
    var fb = ['', 'easy', 'right', 'hard'].map(function (v) {
      return '<label><input type="radio" name="feedback" value="' + v + '"' + (v === '' ? ' checked' : '') + '><span>' + (v ? FEEDBACK[v] : 'Skip') + '</span></label>';
    }).join('');
    return '<form class="form log-form" data-default-minutes="' + (r.minutes || '') + '" hidden>' +
      '<h4 class="form-title">Log it</h4>' +
      '<fieldset><legend>How much did you do?</legend><div class="pills">' +
      '<label><input type="radio" name="status" value="done"><span>Done</span></label>' +
      '<label><input type="radio" name="status" value="part"><span>Did part</span></label></div></fieldset>' +
      '<label class="field">Actual minutes <span class="hint">Write the real time \u2014 a short session still counts.</span>' +
      '<input type="number" name="minutes" min="1" max="300" inputmode="numeric" required></label>' +
      '<label class="field">Finished at<input type="datetime-local" name="completedAt" required></label>' +
      bonus +
      '<fieldset><legend>How did it feel? <span class="hint">(optional)</span></legend><div class="pills">' + fb + '</div></fieldset>' +
      '<div class="row"><button type="submit" class="btn primary">Save</button><button type="button" class="btn ghost" data-action="cancel">Cancel</button></div>' +
      '</form>';
  }

  function moveForm(card) {
    var today = todayStr();
    return '<form class="form move-form" hidden>' +
      '<h4>Move this to another day</h4>' +
      '<label class="field">New day <span class="hint">Any day in the next two weeks.</span>' +
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
        '<span class="b-state">' + (on ? 'Earned!' : 'Not yet') + '</span></div>';
    }).join('');
  }

  function render() {
    renderPlayer();
    renderWeek();
    renderDay();
    renderBadges();
    document.getElementById('storageWarning').hidden = storageOk;
  }

  /* ---------- Actions ---------- */

  function cardFromEl(el) {
    var art = el.closest('article.card');
    if (!art) return null;
    var key = art.getAttribute('data-key');
    return cardsForDate(view.selected).filter(function (c) { return c.key === key; })[0] || null;
  }

  function hideForms(art) {
    art.querySelectorAll('form').forEach(function (f) { f.hidden = true; });
  }

  function openLog(art, card, mode, existing) {
    hideForms(art);
    var f = art.querySelector('.log-form');
    f.querySelectorAll('input[name="status"]').forEach(function (r) { r.checked = r.value === mode; });
    f.querySelector('.form-title').textContent = existing ? 'Edit your session' : mode === 'done' ? 'Great \u2014 log your session' : 'Nice \u2014 every bit counts';
    var min = f.elements.minutes;
    var when = f.elements.completedAt;
    if (existing) {
      min.value = existing.minutes || '';
      when.value = existing.completedAt || nowLocalInput(card.date);
      if (f.elements.secondRound) f.elements.secondRound.checked = !!existing.secondRound;
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
      video: r.video ? r.choice : (r.choice === 'other' ? 'other' : null),
      other: r.choice === 'other' ? (state.otherText[card.key] || 'Own activity') : null,
      secondRound: !!(form.elements.secondRound && form.elements.secondRound.checked && r.choice === 'bodycoach'),
      movedFrom: card.movedFrom || (prev && prev.movedFrom) || null
    };
    // Editing keeps the original activity choice
    if (wasCounted && prev) { entry.video = prev.video; entry.other = prev.other; }
    var before = earnedBadges();
    state.entries[card.key] = entry;
    save();
    var after = earnedBadges();
    var newBadge = BADGES.filter(function (b) { return after[b.id] && !before[b.id]; })[0];
    render();
    if (wasCounted) toast('Updated.');
    else if (newBadge) toast('+10 XP \u2014 new badge: ' + newBadge.name + '!');
    else toast(mode === 'done' ? '+10 XP \u2014 great work!' : '+10 XP \u2014 every bit counts!');
  }

  function saveMove(form, card) {
    var to = form.elements.to.value;
    if (!to) { toast('Pick a day.'); return; }
    if (to === card.date) { toast('That\u2019s the same day \u2014 pick another.'); return; }
    if (ACT_BY_WEEKDAY[weekdayOf(to)] === card.act) { toast('That day already has this activity \u2014 pick another.'); return; }
    if (state.entries[to + '|' + card.act]) { toast('That day already has this activity \u2014 pick another.'); return; }
    state.entries[card.key] = { date: card.date, act: card.act, status: 'rescheduled', to: to, movedFrom: card.movedFrom || null };
    save();
    render();
    toast('Moved to ' + fmtShort(to) + '.');
  }

  function undo(card) {
    var e = state.entries[card.key];
    if (!e) return;
    if (e.status === 'rescheduled') {
      var target = state.entries[e.to + '|' + card.act];
      if (target) { toast('Undo the session on ' + fmtShort(e.to) + ' first.'); return; }
    }
    if (isParticipation(e) && !confirm('Undo this session? Its 10 XP will be removed.')) return;
    delete state.entries[card.key];
    save();
    render();
    toast('Undone.');
  }

  function exportData() {
    var payload = { app: 'move-quest', version: 1, exportedAt: new Date().toISOString(), data: state };
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
      if (!data) { alert('That file doesn\u2019t look like a Move Quest progress file.'); return; }
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
    if (!confirm('Reset everything? This deletes all logged sessions, XP, badges and planned times on this device. Export first if you want a backup.')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    state = emptyState();
    save();
    render();
    toast('Everything reset.');
  }

  function openVideo(btn) {
    var box = btn.closest('.video-box');
    var frame = box.querySelector('.video-frame');
    var open = frame.hidden;
    if (open && !frame.querySelector('iframe')) {
      var id = frame.getAttribute('data-video');
      var ifr = document.createElement('iframe');
      ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?rel=0&playsinline=1';
      ifr.title = frame.getAttribute('data-title') || 'Workout video';
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      ifr.allowFullscreen = true;
      ifr.referrerPolicy = 'strict-origin-when-cross-origin';
      ifr.loading = 'lazy';
      frame.appendChild(ifr);
    }
    frame.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? '\u2715 Hide video' : '\u25B6 Watch and follow';
    if (open) frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function selectDate(d) {
    view.selected = d;
    view.weekStart = weekStartOf(d);
    render();
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var art = btn.closest('article.card');
    var card = art ? cardFromEl(btn) : null;

    switch (action) {
      case 'prev-week': view.weekStart = addDays(view.weekStart, -7); view.selected = view.weekStart; render(); break;
      case 'next-week': view.weekStart = addDays(view.weekStart, 7); view.selected = view.weekStart; render(); break;
      case 'go-today': selectDate(todayStr()); break;
      case 'select-day': selectDate(btn.getAttribute('data-date')); break;
      case 'goto': selectDate(btn.getAttribute('data-date')); document.getElementById('day').focus(); break;
      case 'watch': openVideo(btn); break;
      case 'choose':
        if (card) { state.choices[card.key] = btn.getAttribute('data-choice'); save(); renderDay(); }
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
          save(); render(); toast('Rest logged \u2014 recharging counts.');
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
      render();
    }
  }, 60000);

  render();
})();

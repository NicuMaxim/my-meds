import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, validNight, dailySlots, dailyProgress, medicineMarks, historyDates } from '../app/model.ts';

function settings(night = 'both') {
  const value = structuredClone(defaults);
  value.night = night;
  for (const course of Object.values(value.courses)) Object.assign(course, { start: '2027-01-01', days: 10 });
  value.courses.neurocalmin = { start: '2027-03-10', days: 20 };
  return value;
}
const date = '2027-03-12';
const mark = (slot, day = date) => ({ slot, date: day, taken: 1 });

test('both mode offers as-needed Sedoxil beyond its old course and keeps Nervocalmin course dates', () => {
  const s = settings();
  assert.equal(validNight('both'), true);
  assert.equal(validNight('sedoxil'), true);
  assert.equal(validNight('neurocalmin'), true);
  assert.equal(validNight('unknown'), false);
  assert.equal(validNight(null), false);
  assert.deepEqual(dailySlots(s, date).map(slot => slot.id), ['sedoxil-night', 'neurocalmin-night']);
  assert.deepEqual(dailySlots(s, '2027-03-09').map(slot => slot.id), ['sedoxil-night']);
  assert.deepEqual(dailySlots(s, '2027-03-29').map(slot => slot.id), ['sedoxil-night', 'neurocalmin-night']);
  assert.deepEqual(dailySlots(s, '2027-03-30').map(slot => slot.id), ['sedoxil-night']);
});

test('either bedtime entry completes one planned dose; optional doses do not create missing daily doses', () => {
  const s = settings();
  assert.deepEqual(dailyProgress(s, date, []), { done: 0, total: 1 });
  assert.deepEqual(dailyProgress(s, date, [mark('sedoxil-night')]), { done: 1, total: 1 });
  assert.deepEqual(dailyProgress(s, date, [mark('neurocalmin-night')]), { done: 1, total: 1 });
  assert.deepEqual(dailyProgress(s, date, [mark('sedoxil-night'), mark('neurocalmin-night')]), { done: 1, total: 1 });
  assert.deepEqual(dailyProgress(s, date, [{ ...mark('sedoxil-night'), taken: 0 }]), { done: 0, total: 1 });
  assert.deepEqual(dailyProgress(s, date, [mark('sedoxil-night', '2027-03-11')]), { done: 0, total: 1 });
  assert.deepEqual(dailyProgress(s, '2027-04-01', []), { done: 0, total: 0 });
});

test('existing single-medicine modes retain their course restrictions', () => {
  assert.deepEqual(dailySlots(settings('sedoxil'), date), []);
  assert.deepEqual(dailySlots(settings('neurocalmin'), date).map(slot => slot.id), ['neurocalmin-night']);
  assert.deepEqual(dailySlots(settings('neurocalmin'), '2027-03-30'), []);
});

test('as-needed totals include old and new dates and history retains entries before an edited course start', () => {
  const s = settings();
  const marks = [mark('sedoxil-night', '2027-01-02'), mark('sedoxil-night'), mark('neurocalmin-night'), { ...mark('sedoxil-night', '2027-03-11'), taken: 0 }];
  assert.equal(medicineMarks(s, 'sedoxil', marks).length, 2);
  assert.equal(medicineMarks(s, 'neurocalmin', marks).length, 1);
  assert.equal(medicineMarks(settings('sedoxil'), 'sedoxil', marks).length, 1);
  s.courses.sedoxil.start = '2027-03-20';
  assert(historyDates(s, 'sedoxil', date, marks).includes('2027-01-02'));
  assert(historyDates(s, 'sedoxil', date, marks).includes(date));
  assert.deepEqual(historyDates(s, 'sedoxil', date, []), [date]);
});

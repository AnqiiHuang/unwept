import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, deserialize, journalStatus, newGame, serialize, travelBlock, type Action, type GameState } from '../src/core/state.ts';

function step(state: GameState, action: Action) {
  const next = apply(state, action);
  assert.equal(next.result.ok, true, `${action.type} ${next.result.code}`);
  return next.result.repeat ? state : next.state;
}

function fail(state: GameState, action: Action, code: string) {
  const next = apply(state, action);
  assert.equal(next.result.ok, false);
  assert.equal(next.result.code, code);
  return next.state;
}

function shore(choice: 'drink' | 'pour' = 'drink') {
  let s = step(newGame(), { type: 'finishOpening' });
  s = step(s, { type: 'finishPro01Intro', x: 3240, facing: 1 });
  s = step(s, { type: 'moveChest' });
  s = step(s, { type: 'takeBowl' });
  s = step(s, { type: 'readLining' });
  s = step(s, { type: 'examineMud' });
  s = step(s, { type: 'measure', station: 'stake' });
  s = step(s, { type: 'measure', station: 'prints' });
  s = fail(s, { type: 'judge', side: 'upslope' }, 'wrong-side');
  assert.equal(s.l03, false);
  s = step(s, { type: 'judge', side: 'stake' });
  s = step(s, { type: 'hearContinuation' });
  s = step(s, { type: 'askShore', who: 'guyu' });
  s = step(s, { type: 'finishSong' });
  assert.equal(travelBlock(s, 'PRO-02'), null);
  s = step(s, { type: 'travel', to: 'PRO-02', x: 560, facing: 1 });
  s = step(s, { type: 'finishPro02Intro' });
  s = step(s, { type: 'fish' });
  s = fail(s, { type: 'tea', choice }, 'need-e23');
  s = step(s, { type: 'readE23' });
  s = step(s, { type: 'tea', choice });
  s = step(s, { type: 'travel', to: 'CH1-01', x: 760, facing: 1 });
  return s;
}

test('取碗、测错方向、喝与倒茶、孝布错放都不重复记账', () => {
  let s = shore('drink');
  assert.equal(s.drankOathWater, true);
  assert.equal(s.oathEffect, 'suppressed');
  const again = apply(s, { type: 'tea', choice: 'pour' });
  assert.equal(again.result.repeat, true);
  assert.equal(again.state.drankOathWater, true);

  s = step(s, { type: 'finishHallIntro' });
  s = step(s, { type: 'seePhoto' });
  s = step(s, { type: 'steadyStool' });
  s = step(s, { type: 'receiveCloths' });
  const dup = apply(s, { type: 'receiveCloths' });
  assert.equal(dup.result.repeat, true);
  assert.equal(s.inventory.filter((id) => id === 'long').length, 1);
  assert.equal(s.inventory.filter((id) => id === 'short').length, 1);

  const wrong = apply(s, { type: 'placeCloth', cloth: 'long', target: 'stool' });
  assert.equal(wrong.result.ok, false);
  assert.equal(wrong.result.code, 'wrong-long');
  assert.equal(wrong.state.inventory.includes('long'), true);
  assert.equal(wrong.state.stoolCloth, '');

  s = step(s, { type: 'placeCloth', cloth: 'short', target: 'stool' });
  const occupied = apply(s, { type: 'placeCloth', cloth: 'long', target: 'stool' });
  assert.equal(occupied.result.code, 'occupied');
  assert.equal(s.stoolCloth, 'short');
  s = step(s, { type: 'placeCloth', cloth: 'long', target: 'hook' });
  s = step(s, { type: 'liftCurtain' });
  s = step(s, { type: 'ackRound' });

  assert.equal(s.pz01Done, true);
  assert.equal(s.pz02Done, false);
  assert.deepEqual(s.named, []);
  assert.deepEqual(s.sent, []);
  assert.deepEqual(s.seenEcho, []);
  assert.equal(s.birthKnown, false);
  assert.equal(s.letterKnown, false);
  assert.equal(s.inventory.includes('O01'), true);
  assert.equal(s.inventory.includes('long'), false);
  assert.ok(s.notes.includes('L03'));
  assert.ok(s.notes.includes('HEARD'));
  assert.ok(s.notes.includes('L01'));
  assert.ok(s.notes.includes('O08'));
  assert.ok(s.evidence.includes('E23'));
  assert.equal(s.steps.includes('PZ-02'), false);
  assert.equal(s.steps.filter((id) => id === 'PRO-01.bowl').length, 1);

  const raw = serialize(s);
  const loaded = deserialize(raw);
  const bowl = apply(loaded, { type: 'takeBowl' });
  assert.equal(bowl.result.repeat, true);
  assert.equal(loaded.inventory.filter((id) => id === 'O01').length, 1);
  const cloth = apply(loaded, { type: 'receiveCloths' });
  assert.equal(cloth.result.repeat, true);
  assert.equal(loaded.inventory.includes('long'), false);
});

test('倒茶保持清态，示范高钩后仍要自己放短布', () => {
  let s = shore('pour');
  assert.equal(s.drankOathWater, false);
  assert.equal(s.oathEffect, 'clear');
  s = step(s, { type: 'finishHallIntro' });
  s = step(s, { type: 'steadyStool' });
  s = step(s, { type: 'receiveCloths' });
  s = step(s, { type: 'demoHook' });
  assert.equal(s.hookCloth, 'long');
  assert.equal(s.inventory.includes('short'), true);
  assert.equal(s.pz01Done, false);
  s = fail(s, { type: 'liftCurtain' }, 'need-both');
  s = step(s, { type: 'placeCloth', cloth: 'short', target: 'stool' });
  s = step(s, { type: 'liftCurtain' });
  assert.equal(s.pz01Done, true);
  assert.equal(s.pz02Done, false);
});

test('没唱完不能进村，名册不会因为听见两个音而写入', () => {
  let s = step(newGame(), { type: 'finishOpening' });
  s = step(s, { type: 'takeBowl' });
  s = step(s, { type: 'measure', station: 'prints' });
  assert.equal(travelBlock(s, 'PRO-02'), 'stations');
  s = step(s, { type: 'measure', station: 'stake' });
  s = step(s, { type: 'judge', side: 'stake' });
  assert.equal(travelBlock(s, 'PRO-02'), 'heard');
  s = step(s, { type: 'hearContinuation' });
  assert.equal(s.named.length, 0);
  assert.ok(s.notes.includes('HEARD'));
  assert.equal(travelBlock(s, 'PRO-02'), 'song');
});

function hallReady(choice: 'drink' | 'pour') {
  let s = shore(choice);
  s = step(s, { type: 'finishHallIntro' });
  s = step(s, { type: 'steadyStool' });
  s = step(s, { type: 'receiveCloths' });
  s = step(s, { type: 'placeCloth', cloth: 'short', target: 'stool' });
  s = step(s, { type: 'placeCloth', cloth: 'long', target: 'hook' });
  s = step(s, { type: 'liftCurtain' });
  return s;
}

test('旧的孝布存档能接着取证，猜中扶笔也不能跳过桂芬', () => {
  const finished = hallReady('drink');
  const raw = JSON.parse(serialize(finished)) as Record<string, unknown>;
  delete raw.commissionDone;
  delete raw.bookSeen;
  delete raw.l02;
  delete raw.addressSung;
  delete raw.lampTaken;
  delete raw.pz02Done;
  const old = deserialize(JSON.stringify(raw));
  assert.equal(old.pz01Done, true);
  assert.equal(old.pz02Done, false);
  assert.equal(journalStatus(old).includes('还没完成'), true);
  fail(old, { type: 'singAddress' }, 'need-commission');

  let s = step(old, { type: 'acceptCommission' });
  assert.equal(s.letterKnown, false);
  assert.ok(s.evidence.includes('E10'));
  const commission = apply(s, { type: 'acceptCommission' });
  assert.equal(commission.result.repeat, true);
  assert.equal(s.evidence.filter((id) => id === 'E10').length, 1);

  s = step(s, { type: 'seeBook' });
  assert.equal(s.l02, false);
  assert.ok(s.notes.includes('BOOK'));
  s = step(s, { type: 'singAddress' });
  s = fail(s, { type: 'confirmVerse', card: 'l02' }, 'need-l02');
  assert.equal(s.pz02Done, false);
  s = fail(s, { type: 'confirmVerse', card: 'boat' }, 'wrong-boat');
  s = fail(s, { type: 'confirmVerse', card: 'tea' }, 'wrong-tea');
  assert.equal(s.drankOathWater, true);
  assert.equal(s.oathEffect, 'suppressed');
  assert.equal(s.l02, false);

  s = step(s, { type: 'hearL02' });
  const heard = apply(s, { type: 'hearL02' });
  assert.equal(heard.result.repeat, true);
  assert.equal(s.notes.filter((id) => id === 'L02').length, 1);
  s = step(s, { type: 'confirmVerse', card: 'l02' });
  assert.equal(s.pz02Done, true);
  assert.equal(s.steps.includes('PZ-02.address'), true);
  assert.equal(s.steps.includes('PZ-02.done'), true);
  assert.deepEqual(s.named, []);
  assert.deepEqual(s.sent, []);
  assert.deepEqual(s.seenEcho, []);
  assert.equal(s.birthKnown, false);
  assert.equal(s.tallyRead, false);
  const again = apply(s, { type: 'confirmVerse', card: 'l02' });
  assert.equal(again.result.repeat, true);
  assert.equal(s.notes.filter((id) => id === 'PZ02').length, 1);

  s = step(s, { type: 'takeLamp' });
  const lamp = apply(s, { type: 'takeLamp' });
  assert.equal(lamp.result.repeat, true);
  assert.equal(s.inventory.filter((id) => id === 'LAMP').length, 1);
  const kept = deserialize(serialize(s));
  assert.equal(kept.pz02Done, true);
  assert.equal(kept.lampTaken, true);
  assert.equal(kept.l02, true);
  assert.equal(kept.addressSung, true);
  assert.equal(kept.letterKnown, false);
  assert.deepEqual(kept.named, []);
  assert.equal(journalStatus(kept).includes('灯已借到'), true);
});

test('倒茶也能唱完，误选之后仍可用同一条证词', () => {
  let s = hallReady('pour');
  assert.equal(s.oathEffect, 'clear');
  s = step(s, { type: 'acceptCommission' });
  s = step(s, { type: 'hearL02' });
  s = step(s, { type: 'singAddress' });
  const tea = s.drankOathWater;
  s = fail(s, { type: 'confirmVerse', card: 'boat' }, 'wrong-boat');
  s = fail(s, { type: 'confirmVerse', card: 'tea' }, 'wrong-tea');
  assert.equal(s.drankOathWater, tea);
  assert.equal(s.pz02Done, false);
  s = step(s, { type: 'confirmVerse', card: 'l02' });
  assert.equal(s.pz02Done, true);
  assert.equal(s.oathEffect, 'clear');
  s = step(s, { type: 'seeTally' });
  assert.equal(s.sawTally, true);
  assert.equal(s.tallyRead, false);
  const loaded = deserialize(serialize(s));
  assert.equal(loaded.sawTally, true);
  assert.equal(loaded.tallyRead, false);
  assert.equal(loaded.pz02Done, true);
});

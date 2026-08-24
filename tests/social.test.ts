import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  canFollow,
  clipBody,
  followingAuthorIds,
  matchesQuery,
  remainingChars,
  threadKey,
  timeAgo,
  toggleMember,
  unreadCount,
} from '../src/lib/social'

test('following feed includes the viewer and the people they follow', () => {
  assert.deepEqual(followingAuthorIds('david', ['ines', 'nuno']), ['david', 'ines', 'nuno'])
})

test('toggle like adds then removes the same member', () => {
  const once = toggleMember(['ines'], 'david')
  assert.deepEqual(once, ['ines', 'david'])
  assert.deepEqual(toggleMember(once, 'david'), ['ines'])
})

test('direct message threads share one key both ways', () => {
  assert.equal(threadKey('b', 'a'), threadKey('a', 'b'))
})

test('a profile cannot follow itself', () => {
  assert.equal(canFollow('david', 'david'), false)
  assert.equal(canFollow('david', 'ines'), true)
})

test('unread count and clipped post body', () => {
  assert.equal(unreadCount([{ read: true }, { read: false }, { read: false }]), 2)
  assert.equal(clipBody('  olá  '), 'olá')
  assert.equal(clipBody('x'.repeat(300)).length, 280)
})

test('search matches names and remaining characters stay honest', () => {
  assert.equal(matchesQuery('Fio de Inês', 'ines'), true)
  assert.equal(matchesQuery('Fio de Inês', 'nuno'), false)
  assert.equal(remainingChars('abc'), 277)
})

test('relative time uses the viewer locale', () => {
  const now = Date.parse('2026-08-24T12:00:00.000Z')
  assert.equal(timeAgo('2026-08-24T11:59:00.000Z', now, 'pt'), 'há 1 min')
  assert.equal(timeAgo('2026-08-24T10:00:00.000Z', now, 'en'), '2h')
})

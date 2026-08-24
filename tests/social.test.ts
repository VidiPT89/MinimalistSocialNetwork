import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  canFollow,
  clipBody,
  followingAuthorIds,
  threadKey,
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

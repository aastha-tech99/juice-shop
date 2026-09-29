/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import * as chat from '../../routes/chat'
import { UserModel } from '../../models/user'
import * as security from '../../lib/insecurity'

void describe('chat', () => {
  void describe('summarizeLlmError', () => {
    void it('should handle non-Error objects', () => {
      assert.equal(chat.summarizeLlmError('Simple error string'), 'Simple error string')
      assert.equal(chat.summarizeLlmError('Multi-line\nerror'), 'Multi-line')
    })

    void it('should return reachable message for connection errors', () => {
      assert.equal(chat.summarizeLlmError(new Error('Cannot connect to API')), 'LLM API is not reachable')
      assert.equal(chat.summarizeLlmError(new Error('ECONNREFUSED')), 'LLM API is not reachable')
    })

    void it('should return status code if available', () => {
      const error = new Error('Some error')
      ;(error as any).statusCode = 503
      assert.equal(chat.summarizeLlmError(error), 'LLM API returned status 503')
    })

    void it('should return first line of message otherwise', () => {
      assert.equal(chat.summarizeLlmError(new Error('First line\nSecond line')), 'First line')
      assert.equal(chat.summarizeLlmError(new Error('Trailing colon:')), 'Trailing colon')
    })
  })

  void describe('buildSystemPrompt', () => {
    void it('should include user name if provided', () => {
      const prompt = chat.buildSystemPrompt('John Doe')
      assert.ok(prompt.includes('The customer you are currently chatting with is John Doe.'))
    })

    void it('should not include user name if not provided', () => {
      const prompt = chat.buildSystemPrompt()
      assert.ok(!prompt.includes('The customer you are currently chatting with is'))
    })
  })

  void describe('getUserId', () => {
    void it('should return undefined if no token is present', async () => {
      const userId = await chat.getUserId({ headers: {} } as any)
      assert.equal(userId, undefined)
    })

    void it('should return user ID from decoded token', async () => {
      const token = security.authorize({ data: { id: 42 } })
      const req = { headers: { authorization: `Bearer ${token}` } }
      const userId = await chat.getUserId(req as any)
      assert.equal(userId, 42)
    })
  })

  void describe('sanitizeInput', () => {
    void it('should strip __proto__ keys from objects', () => {
      const input = { role: 'user', __proto__: { polluted: true }, content: 'hello' }
      const result = chat.sanitizeInput(input) as Record<string, unknown>
      assert.equal(result.role, 'user')
      assert.equal(result.content, 'hello')
      assert.equal(('polluted' in Object.prototype), false)
    })

    void it('should strip constructor and prototype keys', () => {
      const input = { a: 1, constructor: { prototype: { bad: true } }, prototype: {} }
      const result = chat.sanitizeInput(input) as Record<string, unknown>
      assert.equal(result.a, 1)
      assert.equal(result.constructor, undefined)
      assert.equal(result.prototype, undefined)
    })

    void it('should recursively sanitize nested objects', () => {
      const input = { outer: { __proto__: { x: 1 }, safe: 'ok' } }
      const result = chat.sanitizeInput(input) as Record<string, any>
      assert.equal(result.outer.safe, 'ok')
    })

    void it('should sanitize objects inside arrays', () => {
      const input = [{ role: 'user', constructor: 'bad' }, { role: 'assistant' }]
      const result = chat.sanitizeInput(input) as Array<Record<string, unknown>>
      assert.equal(result.length, 2)
      assert.equal(result[0].role, 'user')
      assert.equal(result[0].constructor, undefined)
      assert.equal(result[1].role, 'assistant')
    })

    void it('should pass through primitives unchanged', () => {
      assert.equal(chat.sanitizeInput('hello'), 'hello')
      assert.equal(chat.sanitizeInput(42), 42)
      assert.equal(chat.sanitizeInput(null), null)
      assert.equal(chat.sanitizeInput(undefined), undefined)
    })
  })

  void describe('getUserNameFromToken', () => {
    void it('should return undefined if no user ID is found', async () => {
      const userName = await chat.getUserNameFromToken({ headers: {} } as any)
      assert.equal(userName, undefined)
    })

    void it('should return username from database', async () => {
      const token = security.authorize({ data: { id: 42 } })
      const req = { headers: { authorization: `Bearer ${token}` } }
      mock.method(UserModel, 'findByPk', async () => ({ username: 'jdoe' }))
      const userName = await chat.getUserNameFromToken(req as any)
      assert.equal(userName, 'jdoe')
    })
  })
})

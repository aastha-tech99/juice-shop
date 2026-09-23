/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { type ChallengeKey } from '@juice-shop/models/challenge'
import logger from './logger'
import colors from 'colors/safe'
interface SolveEntry { 'find it': boolean, 'fix it': boolean, attempts: { 'find it': number, 'fix it': number } }
const solves = new Map<string, SolveEntry>()

type Phase = 'find it' | 'fix it'

export const storeFindItVerdict = (challengeKey: ChallengeKey, verdict: boolean) => {
  storeVerdict(challengeKey, 'find it', verdict)
}

export const storeFixItVerdict = (challengeKey: ChallengeKey, verdict: boolean) => {
  storeVerdict(challengeKey, 'fix it', verdict)
}

export const calculateFindItAccuracy = (challengeKey: ChallengeKey) => {
  return calculateAccuracy(challengeKey, 'find it')
}

export const calculateFixItAccuracy = (challengeKey: ChallengeKey) => {
  return calculateAccuracy(challengeKey, 'fix it')
}

export const totalFindItAccuracy = () => {
  return totalAccuracy('find it')
}

export const totalFixItAccuracy = () => {
  return totalAccuracy('fix it')
}

export const getFindItAttempts = (challengeKey: ChallengeKey) => {
  const entry = solves.get(challengeKey)
  return entry ? entry.attempts['find it'] : 0
}

export const reset = () => {
  solves.clear()
}

function totalAccuracy (phase: Phase) {
  let sumAccuracy = 0
  let totalSolved = 0
  for (const value of solves.values()) {
    if (value[phase]) {
      sumAccuracy += 1 / value.attempts[phase]
      totalSolved++
    }
  }
  return sumAccuracy / totalSolved
}

function calculateAccuracy (challengeKey: ChallengeKey, phase: Phase) {
  let accuracy = 0
  const entry = solves.get(challengeKey)
  if (entry && entry[phase]) {
    accuracy = 1 / entry.attempts[phase]
  }
  logger.info(`Accuracy for '${phase === 'fix it' ? 'Fix It' : 'Find It'}' phase of coding challenge ${colors.cyan(challengeKey)}: ${accuracy > 0.5 ? colors.green(accuracy.toString()) : (accuracy > 0.25 ? colors.yellow(accuracy.toString()) : colors.red(accuracy.toString()))}`)
  return accuracy
}

function storeVerdict (challengeKey: ChallengeKey, phase: Phase, verdict: boolean) {
  let entry = solves.get(challengeKey)
  if (!entry) {
    entry = { 'find it': false, 'fix it': false, attempts: { 'find it': 0, 'fix it': 0 } }
    solves.set(challengeKey, entry)
  }
  if (!entry[phase]) {
    entry[phase] = verdict
    entry.attempts[phase]++
  }
}

import test from "node:test";
import assert from "node:assert/strict";
import { calculateLeadScore } from "../lib/lead-score.mjs";

test("lead score is weighted and rounded", () => {
  assert.equal(calculateLeadScore({ fit: 100, need: 80, location: 100, size: 70, contactability: 90, intent: 60 }), 87);
});

test("lead score is clamped to 0..100", () => {
  assert.equal(calculateLeadScore({ fit: 200, need: 200, location: 200, size: 200, contactability: 200, intent: 200 }), 100);
  assert.equal(calculateLeadScore({ fit: -100, need: -100, location: -100, size: -100, contactability: -100, intent: -100 }), 0);
});

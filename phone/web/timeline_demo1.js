window.TL = {
 "demo": "demo1",
 "title": "Call your coding agent",
 "total": 122.858,
 "cues": {
  "hook_read": 0.0,
  "read_cut": 8.52,
  "hook_split": 16.554,
  "dial": 41.573,
  "connected": 44.173,
  "ask_agent": 47.641,
  "agent_log": 48.141,
  "compress": 49.241,
  "task": 63.778,
  "hangup": 70.864,
  "work": 71.364,
  "question": 77.201,
  "incoming": 79.201,
  "answered": 81.601,
  "approve": 97.64,
  "hangup2": 105.126,
  "sms": 105.126
 },
 "lines": [
  {
   "id": "read_01",
   "role": "robot",
   "who": "Voice mode today: read aloud",
   "phone": false,
   "text": "Here's a summary. Hash, test results. Two hundred twelve passed, two failed. Failed tests. Bullet. Test underscore checkout underscore currency, line forty-two, assertion error, expected nineteen point nine nine, got nineteen point nine eight. Bullet. Test underscore",
   "start": 0.6,
   "dur": 7.6
  },
  {
   "id": "narr_01",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "Most agents speak text. Voice mode just reads that text aloud, every symbol and every line.",
   "start": 8.92,
   "dur": 7.314
  },
  {
   "id": "narr_02",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "A real voice is different. It listens, it summarises, it asks before it acts, and it calls you back when the work is done.",
   "start": 16.554,
   "dur": 9.091
  },
  {
   "id": "narr_03",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "AgentLine gives every text agent a real voice, and a phone number.",
   "start": 25.965,
   "dur": 4.911
  },
  {
   "id": "narr_04",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "Here's my coding agent. It runs in the cloud, and now it has a phone number. I'm out for a walk, so I call it.",
   "start": 34.096,
   "dur": 7.158
  },
  {
   "id": "v_01",
   "role": "vignesh",
   "who": "Me, on the phone",
   "phone": true,
   "text": "Hey. Did last night's test run pass?",
   "start": 44.473,
   "dur": 2.847
  },
  {
   "id": "ag_01",
   "role": "coder",
   "who": "My coding agent \u00b7 voice by AgentLine",
   "phone": true,
   "text": "Mostly. Two hundred twelve of two hundred fourteen tests passed. Two checkout tests failed after yesterday's payment change. Want me to look into it?",
   "start": 49.241,
   "dur": 9.143
  },
  {
   "id": "v_02",
   "role": "vignesh",
   "who": "Me, on the phone",
   "phone": true,
   "text": "Yes. Fix them and open a pull request. But don't merge.",
   "start": 58.704,
   "dur": 4.754
  },
  {
   "id": "ag_02",
   "role": "coder",
   "who": "My coding agent \u00b7 voice by AgentLine",
   "phone": true,
   "text": "Got it. I'll fix both tests and open a pull request, without merging. It'll take a few minutes. I'll call you back.",
   "start": 63.778,
   "dur": 6.766
  },
  {
   "id": "narr_05",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "I hang up. The agent keeps working in the cloud.",
   "start": 71.364,
   "dur": 3.318
  },
  {
   "id": "ag_03",
   "role": "coder",
   "who": "My coding agent \u00b7 voice by AgentLine",
   "phone": true,
   "text": "Hi, it's your coding agent. I found it: a rounding bug in the new currency code. Both tests pass now. One question first. Refunds use the same code. Should I fix them too?",
   "start": 81.901,
   "dur": 12.983
  },
  {
   "id": "v_03",
   "role": "vignesh",
   "who": "Me, on the phone",
   "phone": true,
   "text": "Yes, fix refunds too.",
   "start": 95.204,
   "dur": 2.116
  },
  {
   "id": "ag_04",
   "role": "coder",
   "who": "My coding agent \u00b7 voice by AgentLine",
   "phone": true,
   "text": "Done. All two hundred fourteen tests pass, and the pull request is open. I've texted you the link.",
   "start": 98.04,
   "dur": 6.766
  },
  {
   "id": "narr_06",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "The agent did the work. AgentLine did the talking. It summarised, it asked before deciding, and it called me back.",
   "start": 105.726,
   "dur": 8.359
  },
  {
   "id": "narr_07",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "Any agent that runs in the cloud can have a real voice, and a phone number.",
   "start": 114.705,
   "dur": 4.833
  }
 ],
 "scenes": [
  {
   "name": "hook",
   "t": 0.0
  },
  {
   "name": "title",
   "t": 31.196
  },
  {
   "name": "call1",
   "t": 33.596
  },
  {
   "name": "end",
   "t": 114.405
  }
 ],
 "sfx": [
  {
   "name": "ringback",
   "t": 41.573
  },
  {
   "name": "hangup",
   "t": 70.864
  },
  {
   "name": "ring",
   "t": 79.201
  },
  {
   "name": "hangup",
   "t": 105.126
  },
  {
   "name": "ping",
   "t": 105.126
  }
 ],
 "config": {
  "product_name": "AgentLine",
  "product_name_spoken": "AgentLine",
  "tagline": "A real voice and a phone number for every agent.",
  "illustrative_tag": "Illustrative product concept",
  "small_print": "Illustrative product concept. The product, screens, calls and numbers shown are mocked.",
  "_note": "AgentLine is a placeholder name. Change it here; the script uses {{product}} everywhere."
 }
};

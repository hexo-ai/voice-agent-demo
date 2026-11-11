window.TL = {
 "demo": "demo2",
 "title": "Give your agent a voice and a phone number",
 "total": 114.326,
 "cues": {
  "hook_read": 0.0,
  "read_cut": 8.52,
  "hook_split": 16.554,
  "chat": 34.096,
  "code": 43.898,
  "connect": 50.096,
  "dial": 59.162,
  "connected": 61.562,
  "lookup": 66.309,
  "answer_text": 66.809,
  "onestep": 67.809,
  "step1": 74.98,
  "warranty": 85.963,
  "step2": 86.263,
  "hangup": 97.927
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
   "id": "narr_10",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "Say I'm a developer. I built a text assistant that helps people fix home appliances. It looks up manuals, checks warranties and books technicians.",
   "start": 34.096,
   "dur": 9.482
  },
  {
   "id": "narr_11",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "To give it a voice and a phone number, I add three lines of code. My agent doesn't change.",
   "start": 43.898,
   "dur": 5.878
  },
  {
   "id": "narr_12",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "It reads what my agent can do, and speaks for it. Now anyone can call it.",
   "start": 53.296,
   "dur": 5.146
  },
  {
   "id": "c_01",
   "role": "maya",
   "who": "Maya, a customer",
   "phone": true,
   "text": "Hi. My dishwasher stopped mid-cycle, and it's flashing E24.",
   "start": 61.862,
   "dur": 4.127
  },
  {
   "id": "as_01",
   "role": "fixit",
   "who": "Fixit assistant \u00b7 voice by AgentLine",
   "phone": true,
   "text": "Sorry about that. E24 usually means it isn't draining. Is there water at the bottom?",
   "start": 67.809,
   "dur": 5.094
  },
  {
   "id": "c_02",
   "role": "maya",
   "who": "Maya, a customer",
   "phone": true,
   "text": "Yes, a few inches.",
   "start": 73.223,
   "dur": 1.437
  },
  {
   "id": "as_02",
   "role": "fixit",
   "who": "Fixit assistant \u00b7 voice by AgentLine",
   "phone": true,
   "text": "Okay. Turn the dishwasher off. Then pull out the bottom rack, and twist the filter to the left. Tell me when it's out.",
   "start": 74.98,
   "dur": 6.818
  },
  {
   "id": "c_03",
   "role": "maya",
   "who": "Maya, a customer",
   "phone": true,
   "text": "Okay, it's out. Ugh, it's full of gunk.",
   "start": 83.318,
   "dur": 2.325
  },
  {
   "id": "as_03",
   "role": "fixit",
   "who": "Fixit assistant \u00b7 voice by AgentLine",
   "phone": true,
   "text": "That's probably the problem. Rinse it, put it back, and run a rinse cycle. If E24 comes back, I can book a technician. Your warranty covers it until March.",
   "start": 86.263,
   "dur": 9.874
  },
  {
   "id": "c_04",
   "role": "maya",
   "who": "Maya, a customer",
   "phone": true,
   "text": "Perfect. Thanks!",
   "start": 96.457,
   "dur": 1.149
  },
  {
   "id": "narr_13",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "Same agent, same code. My text assistant now answers the phone, and talks like a person, one step at a time.",
   "start": 98.527,
   "dur": 7.889
  },
  {
   "id": "narr_14",
   "role": "narrator",
   "who": "Vignesh",
   "phone": false,
   "text": "Any text agent can have a real voice, and a phone number.",
   "start": 107.036,
   "dur": 3.971
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
   "name": "setup",
   "t": 33.596
  },
  {
   "name": "call2",
   "t": 58.762
  },
  {
   "name": "end",
   "t": 106.736
  }
 ],
 "sfx": [
  {
   "name": "ringback",
   "t": 59.162
  },
  {
   "name": "hangup",
   "t": 97.927
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

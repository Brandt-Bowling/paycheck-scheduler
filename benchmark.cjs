const { performance } = require('perf_hooks');

const templates = [
  { id: 't1', name: 'Template 1', defaultStartTime: '09:00', defaultEndTime: '10:00' },
  { id: 't2', name: 'Template 2', defaultStartTime: '10:00', defaultEndTime: '11:00' },
  { id: 't3', name: 'Template 3', defaultStartTime: '11:00', defaultEndTime: '12:00' },
  { id: 't4', name: 'Template 4', defaultStartTime: '12:00', defaultEndTime: '13:00' },
  { id: 'school-dropoff', name: 'Dropoff', defaultStartTime: '07:30', defaultEndTime: '08:00' },
  { id: 'school-pickup', name: 'Pickup', defaultStartTime: '15:00', defaultEndTime: '15:30' },
  { id: 'office-day', name: 'Office', defaultStartTime: '09:00', defaultEndTime: '17:00' },
  { id: 'hannah-work', name: 'Work', defaultStartTime: '15:00', defaultEndTime: '23:30' },
  { id: 't5', name: 'Template 5', defaultStartTime: '13:00', defaultEndTime: '14:00' },
  { id: 't6', name: 'Template 6', defaultStartTime: '14:00', defaultEndTime: '15:00' },
];

const selectedTemplate = 'hannah-work';
const ITERATIONS = 1000000;

function runBaseline() {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) continue;
  }
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const template = templates.find((t) => t.id === selectedTemplate);
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const t = template;
    if (!t) continue;
  }
  const end = performance.now();
  return end - start;
}

const baselineTime = runBaseline();
const optimizedTime = runOptimized();

console.log(`Baseline time: ${baselineTime.toFixed(2)} ms`);
console.log(`Optimized time: ${optimizedTime.toFixed(2)} ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);

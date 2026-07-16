import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : 50,
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_duration: ['p(95) < 500', 'p(99) < 1000'],
    http_req_failed: ['rate < 0.02'],
  },
};

const BASE_URL = __ENV.ANS_BASE_URL || 'http://ans-registry.ans-system.svc.cluster.local:8080';
const DISCOVERY_PATH = __ENV.DISCOVERY_PATH || '/discover';
const CAPABILITY_PATH = __ENV.CAPABILITY_PATH || '/capability';
const CAPABILITY = __ENV.CAPABILITY || 'ml-inference';
const AGENT_COUNT = __ENV.AGENT_COUNT ? parseInt(__ENV.AGENT_COUNT, 10) : 1000;

export default function () {
  const agentIndex = (__VU - 1) % AGENT_COUNT;
  const discoveryUrl = `${BASE_URL}${DISCOVERY_PATH}?capability=${CAPABILITY}&provider=research-lab`;
  const discoveryRes = http.get(discoveryUrl);
  check(discoveryRes, {
    'discovery status was 200': (r) => r.status === 200,
  });

  const capabilityUrl = `${BASE_URL}${CAPABILITY_PATH}?agent=agent-${agentIndex}&capability=${CAPABILITY}`;
  const capabilityRes = http.get(capabilityUrl);
  check(capabilityRes, {
    'capability status was 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 1.5 + 0.1);
}

export function handleSummary(data) {
  return {
    [__ENV.SUMMARY_OUTPUT || 'k6_ans_load_test_summary.json']: JSON.stringify(data, null, 2),
  };
}


import { StartupFailure } from './types';

export const SEED_STARTUPS: StartupFailure[] = [
  {
    id: '1',
    name: 'Quibi',
    industry: 'Streaming / Media',
    founded: 2018,
    defunct: 2020,
    valuationAtPeak: '$1.75 Billion',
    description: 'High-quality short-form content designed specifically for mobile viewing.',
    reasonForFailure: 'Misunderstanding consumer habits, lack of social sharing features, and launching during a pandemic where mobile consumption dropped as people stayed home.',
    image: 'https://picsum.photos/seed/quibi/800/400',
    solutions: []
  },
  {
    id: '2',
    name: 'Juicero',
    industry: 'Hardware / Consumer Goods',
    founded: 2013,
    defunct: 2017,
    valuationAtPeak: '$120 Million',
    description: 'A high-end "cold-press" juicing machine that used proprietary packs.',
    reasonForFailure: 'Over-engineering. A viral video showed the juice packs could be squeezed by hand just as effectively as the $400 machine.',
    image: 'https://picsum.photos/seed/juicero/800/400',
    solutions: []
  },
  {
    id: '3',
    name: 'Webvan',
    industry: 'E-commerce / Grocery',
    founded: 1996,
    defunct: 2001,
    valuationAtPeak: '$1.2 Billion',
    description: 'Online grocery delivery service with massive custom-built automated warehouses.',
    reasonForFailure: 'Expanding too fast before proving the business model in a single market, leading to massive capital expenditure burnout.',
    image: 'https://picsum.photos/seed/webvan/800/400',
    solutions: []
  },
  {
    id: '4',
    name: 'Theranos',
    industry: 'HealthTech',
    founded: 2003,
    defunct: 2018,
    valuationAtPeak: '$9 Billion',
    description: 'Revolutionary blood testing technology using only tiny amounts of blood.',
    reasonForFailure: 'Fraud and technology that simply did not work as advertised. Massive regulatory failures and ethical breaches.',
    image: 'https://picsum.photos/seed/theranos/800/400',
    solutions: []
  }
];

import { Category } from './theme';

export type Source = 'newsapi' | 'reddit';

export interface TrendCard {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: Category;
  source: Source;
  region: string;
  timestamp: string;
  trendingScore: number;
  engagements: number;
  hashtags: string[];
  isAd: boolean;
  adLabel?: string;
  adCta?: string;
  adUrl?: string;
  tall?: boolean;
}

export const MOCK_CARDS: TrendCard[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Three Rate Cuts in 2025',
    summary: 'Fed Chair hints at easing cycle as inflation metrics cool below 2.4% for third consecutive month.',
    details:
      'The Federal Reserve has signaled a potential pivot in monetary policy, with Chair Jerome Powell suggesting that three rate cuts could be on the table for the remainder of 2025. The latest CPI data showed inflation cooling to 2.4%, the third consecutive month below the Fed\'s longer-run target range. Markets reacted immediately, with the S&P 500 gaining 1.8% and Treasury yields dropping sharply across the curve.\n\nEconomists are divided on the timing. Goldman Sachs projects the first cut in July, while JPMorgan holds to a September view. Small-cap stocks and REITs are among the biggest beneficiaries of the anticipated easing.\n\n"We are seeing the data we need to see," Powell told reporters. "The labor market remains resilient, and price stability is returning." The dollar weakened 0.6% against a basket of currencies on the news.',
    category: 'finance',
    source: 'reddit',
    region: 'US',
    timestamp: '1h ago',
    trendingScore: 96,
    engagements: 142800,
    hashtags: ['FederalReserve', 'RateCuts', 'Economy', 'Inflation'],
    isAd: false,
    tall: true,
  },
  {
    id: '2',
    title: 'Apple Unveils AI-Powered MacBook with 72-Hour Battery',
    summary: 'New M5 Ultra chip delivers 4× performance uplift, on-device LLM inference, and unprecedented endurance.',
    details:
      'Apple shocked the tech world at its spring event by announcing the MacBook Pro M5 Ultra, featuring a custom silicon chip that integrates a dedicated neural processing unit capable of running 70-billion-parameter language models entirely on-device. The 72-hour claimed battery life — nearly triple the previous generation — is powered by a graphene-composite battery cell and extreme efficiency improvements in the 3nm process node.\n\nCraig Federighi demonstrated real-time video transcription, on-device document summarization, and local image generation without any internet connection. Privacy advocates praised the offline-first approach.\n\nThe MacBook Pro M5 Ultra starts at $2,499 and ships next month. Pre-orders opened immediately, with analysts forecasting $8 billion in revenue in the launch quarter alone.',
    category: 'tech',
    source: 'newsapi',
    region: 'US',
    timestamp: '2h ago',
    trendingScore: 99,
    engagements: 287400,
    hashtags: ['Apple', 'M5Ultra', 'MacBook', 'AI'],
    isAd: false,
  },
  {
    id: 'ad1',
    title: 'Grow Your Portfolio with Wealthfront',
    summary: 'Automated investing, tax-loss harvesting, and high-yield cash accounts — all in one place.',
    details: 'Wealthfront is the smartest way to build long-term wealth. Join 1 million+ investors who trust our automated platform.',
    category: 'finance',
    source: 'reddit',
    region: 'US',
    timestamp: 'Sponsored',
    trendingScore: 0,
    engagements: 0,
    hashtags: [],
    isAd: true,
    adLabel: 'Sponsored',
    adCta: 'Get Started Free',
    adUrl: '#',
  },
  {
    id: '3',
    title: 'Champions League Final: Real Madrid vs Man City Preview',
    summary: 'Ancelotti and Guardiola clash for European glory in Munich. Mbappé vs Haaland is the duel of the century.',
    details:
      'The UEFA Champions League Final at Munich\'s Allianz Arena promises to be the most-watched club football match in history, with global audience estimates exceeding 450 million viewers. Real Madrid, chasing their 16th European title, enter on the back of a stunning semi-final comeback against Bayern Munich. Manchester City, seeking a back-to-back crown, are slight favorites according to betting markets.\n\nKylian Mbappé has been in irresistible form with 14 goals in this Champions League campaign, while Erling Haaland leads City with 11. Tactically, the match-up between Ancelotti\'s fluid 4-3-3 and Guardiola\'s positional high press sets the stage for a chess match of the highest order.\n\nTickets on the secondary market are selling for upwards of €8,000. The final kicks off Saturday at 21:00 CET.',
    category: 'sport',
    source: 'reddit',
    region: 'GB',
    timestamp: '3h ago',
    trendingScore: 98,
    engagements: 312000,
    hashtags: ['UCLFinal', 'RealMadrid', 'ManCity', 'Mbappe', 'Haaland'],
    isAd: false,
    tall: true,
  },
  {
    id: '4',
    title: 'Senate Passes Historic Climate Infrastructure Bill',
    summary: '$800B package funds clean energy grid, EV infrastructure, and carbon capture across all 50 states.',
    details:
      'The United States Senate passed the landmark Clean Future Infrastructure Act by a 58-42 bipartisan margin, the largest climate-focused spending bill in American history. The $800 billion package allocates funds over 10 years for a modernized national electrical grid, 500,000 new EV charging stations, carbon capture facilities at major industrial sites, and green hydrogen production hubs.\n\nEnvironmental groups called it "transformational." Energy companies are already positioning for massive contract opportunities, with shares of NextEra Energy and First Solar surging 12% and 18% respectively.\n\nCritics argue the bill\'s inflation offset mechanisms are insufficient, while proponents cite the Congressional Budget Office\'s finding that it will reduce the deficit by $130 billion over a decade through energy royalties and efficiency savings.',
    category: 'politics',
    source: 'newsapi',
    region: 'US',
    timestamp: '4h ago',
    trendingScore: 91,
    engagements: 98700,
    hashtags: ['ClimateAct', 'Senate', 'GreenEnergy', 'Congress'],
    isAd: false,
  },
  {
    id: '5',
    title: 'Dune: Messiah Wraps Production — First Look Images Drop',
    summary: 'Denis Villeneuve\'s finale is described as "the darkest sci-fi epic ever made." Timothée Chalamet returns.',
    details:
      'Director Denis Villeneuve confirmed that principal photography on Dune: Messiah has wrapped, sharing the first official images of the production on social media. The images reveal Arrakis transformed — scarred by years of war, with Paul Atreides shown in a haunting close-up, his blue-within-blue eyes now tinged with gold.\n\nVilleneuve described the film as "an exploration of the cost of prophecy and the monster that power creates." Composer Hans Zimmer has reportedly delivered a score that blends electronic minimalism with orchestral chaos.\n\nThe film is set for a December release. Warner Bros. is already planning awards campaigns, with analysts predicting it could become the highest-grossing film of the decade.',
    category: 'entertainment',
    source: 'reddit',
    region: 'US',
    timestamp: '5h ago',
    trendingScore: 94,
    engagements: 178300,
    hashtags: ['Dune', 'DuneMessiah', 'Villeneuve', 'SciFi'],
    isAd: false,
    tall: true,
  },
  {
    id: '6',
    title: 'OpenAI Releases GPT-5 With Real-Time Vision & Memory',
    summary: 'The new model maintains context across unlimited sessions and can see through live camera feeds.',
    details:
      'OpenAI unveiled GPT-5, its most capable model yet, featuring continuous memory across sessions and real-time visual processing through connected cameras. The model can now remember user preferences, past conversations, and ongoing projects indefinitely — unless the user opts out.\n\nEarly benchmarks show GPT-5 surpassing human expert performance on medical diagnosis, legal reasoning, and advanced mathematics. The real-time vision capability allows the model to analyze video streams, making it viable for live surveillance assistance, surgical guidance, and autonomous vehicle co-piloting.\n\nPrivacy advocates have raised urgent concerns about the persistent memory feature. OpenAI CEO Sam Altman acknowledged the sensitivity: "We\'re giving users granular controls — you own your memory, always."',
    category: 'tech',
    source: 'newsapi',
    region: 'US',
    timestamp: '6h ago',
    trendingScore: 100,
    engagements: 445000,
    hashtags: ['GPT5', 'OpenAI', 'AI', 'AGI'],
    isAd: false,
  },
  {
    id: 'ad2',
    title: 'Bloomberg Terminal — Now for Everyone',
    summary: 'Professional-grade financial data, news, and analytics. First month free for Whyrl readers.',
    details: 'Access the same data that moves markets. Bloomberg anywhere, on any device.',
    category: 'finance',
    source: 'newsapi',
    region: 'US',
    timestamp: 'Sponsored',
    trendingScore: 0,
    engagements: 0,
    hashtags: [],
    isAd: true,
    adLabel: 'Promoted',
    adCta: 'Claim Free Month',
    adUrl: '#',
  },
  {
    id: '7',
    title: 'UK General Election: Labour Surges to 20-Point Lead',
    summary: 'New polling shows Keir Starmer\'s party at 52%, with the Tories at 32% — lowest in 40 years.',
    details:
      'A comprehensive YouGov poll of 12,000 UK voters has placed Labour at 52% voting intention — a 20-point lead over the Conservative Party, which sits at 32%, its lowest polling in four decades. The Liberal Democrats are at 12%.\n\nThe economic picture is cited by 68% of swing voters as the primary reason for the shift. Rising mortgage costs, stagnant wages, and the cost-of-living crisis have eroded Conservative support even in traditional strongholds in the South East.\n\nPolitical analysts now consider a Labour landslide almost certain in the upcoming general election. The question is the scale of the majority. Some models project Labour winning 450+ seats — comparable to Blair\'s 1997 victory.',
    category: 'politics',
    source: 'reddit',
    region: 'GB',
    timestamp: '7h ago',
    trendingScore: 89,
    engagements: 87600,
    hashtags: ['UKElection', 'Labour', 'Tories', 'KeithStarmer'],
    isAd: false,
    tall: true,
  },
  {
    id: '8',
    title: 'Nvidia\'s Market Cap Surpasses $5 Trillion',
    summary: 'Jensen Huang\'s chipmaker becomes the most valuable company in history, overtaking Apple and Microsoft.',
    details:
      'Nvidia surpassed $5 trillion in market capitalization today, becoming the most valuable publicly traded company in history, overtaking both Apple ($4.8T) and Microsoft ($4.6T). The milestone was reached as shares rose 3.2% following an analyst day presentation that revealed the Blackwell Ultra GPU architecture — a 70% performance improvement over the current generation.\n\nDemand for Nvidia\'s AI training chips remains insatiable, with hyperscalers including Amazon, Google, and Microsoft competing for allocation. The company\'s data center revenue grew 427% year-over-year in the last quarter.\n\nCEO Jensen Huang, wearing his signature leather jacket, told investors: "We are at the beginning of a new industrial revolution. Every company will need to think about AI infrastructure the way they think about electricity."',
    category: 'finance',
    source: 'newsapi',
    region: 'US',
    timestamp: '8h ago',
    trendingScore: 97,
    engagements: 231000,
    hashtags: ['Nvidia', 'Jensen', 'AI', 'Stocks', 'MarketCap'],
    isAd: false,
  },
  {
    id: '9',
    title: 'Netflix Drops 8-Part Docuseries on the 2008 Crash',
    summary: 'New series features exclusive interviews with Lehman Bros executives and reveals never-before-seen documents.',
    details:
      'Netflix\'s new docuseries "The Last Bailout" promises the definitive account of the 2008 global financial crisis, featuring 47 exclusive interviews including former Lehman Brothers CEO Richard Fuld, ex-Treasury Secretary Hank Paulson, and traders who profited by shorting mortgage-backed securities.\n\nProduced over four years, the series draws on 60,000 pages of newly declassified Federal Reserve documents and Congressional testimony. Episode three reportedly reveals internal emails showing executives were aware of the housing market collapse six months before it became public.\n\nAI-enhanced archival footage and dramatic re-enactments are interwoven with the testimony. Critics who attended the premiere called it "the most important financial documentary ever made."',
    category: 'entertainment',
    source: 'reddit',
    region: 'US',
    timestamp: '9h ago',
    trendingScore: 85,
    engagements: 76400,
    hashtags: ['Netflix', 'Documentary', 'Finance', 'WallStreet'],
    isAd: false,
  },
  {
    id: '10',
    title: 'North Korea Launches Satellite; UN Emergency Session Called',
    summary: 'Pyongyang claims surveillance capability over US military bases in the Pacific. G7 convenes.',
    details:
      'North Korea successfully launched what it describes as a "multi-purpose reconnaissance satellite" capable of imaging United States military installations across the Pacific, triggering an emergency session of the UN Security Council. The satellite, designated KMS-7, reportedly completed three orbits before transmitting imagery back to Pyongyang.\n\nThe launch represents a significant advancement in North Korea\'s space program and constitutes a violation of multiple UN Security Council resolutions. South Korea scrambled jets and placed its military on heightened alert.\n\nChina and Russia, as permanent Security Council members, are expected to veto any new sanctions resolution, deepening diplomatic tensions. US Secretary of State issued a statement condemning "this flagrant provocation" and promised a "measured but decisive response."',
    category: 'world',
    source: 'newsapi',
    region: 'US',
    timestamp: '10h ago',
    trendingScore: 92,
    engagements: 156700,
    hashtags: ['NorthKorea', 'UNSecurity', 'Geopolitics', 'G7'],
    isAd: false,
    tall: true,
  },
  {
    id: '11',
    title: 'Simone Biles Announces Comeback for 2028 LA Olympics',
    summary: 'Greatest gymnast of all time eyes an unprecedented 5th Olympic campaign at age 31.',
    details:
      'Simone Biles announced on social media that she intends to compete at the 2028 Los Angeles Olympic Games, targeting what would be her fifth and final Olympic campaign at the age of 31. The 7-time Olympic gold medalist made the announcement in an emotional video, thanking fans and her training team.\n\n"Los Angeles is my chance to show the world that age is just a number," Biles said. "I\'m training harder than I ever have, and I feel incredible."\n\nUSA Gymnastics confirmed her continued affiliation with the national program. Sports scientists noted that gymnastics athletes are now performing at elite levels into their early 30s due to advances in sports medicine and load management. Analysts expect her return to generate unprecedented viewership for the home-country Games.',
    category: 'sport',
    source: 'newsapi',
    region: 'US',
    timestamp: '11h ago',
    trendingScore: 93,
    engagements: 198200,
    hashtags: ['SimoneBiles', 'Olympics', 'LA2028', 'Gymnastics'],
    isAd: false,
  },
  {
    id: '12',
    title: 'Google Launches Quantum Computer Available via Cloud',
    summary: '1,000-qubit Willow 2 processor is now accessible through Google Cloud — pricing at $9.99/minute.',
    details:
      'Google has made its next-generation 1,000-qubit Willow 2 quantum processor available to businesses and researchers via Google Cloud, marking the first commercial deployment of a fault-tolerant quantum computer at scale. The system can solve certain optimization problems in minutes that would take classical supercomputers billions of years.\n\nEarly access customers include pharmaceutical giant Pfizer for molecular simulation, logistics firm DHL for route optimization, and financial services firm Jane Street for portfolio optimization. Results across all three use cases showed dramatic speedups.\n\nAt $9.99 per minute, quantum compute time remains expensive, but Google promises costs will drop 90% over three years as manufacturing scales. IBM and IonQ have announced competing commercial quantum offerings, igniting what analysts are calling "the quantum cloud wars."',
    category: 'tech',
    source: 'reddit',
    region: 'US',
    timestamp: '12h ago',
    trendingScore: 88,
    engagements: 112400,
    hashtags: ['Google', 'QuantumComputing', 'Cloud', 'Willow'],
    isAd: false,
  },
];

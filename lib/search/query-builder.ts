import { FOCUS_AREAS, type FocusAreaKey } from "@/lib/prompts/focus-areas";
import type {
  PriorityArea,
  ResearchDepth,
  ResearchObjective,
} from "@/lib/research/types";

export interface QueryBuilderInput {
  entityName: string;
  domain?: string;
  objective: ResearchObjective;
  depth: ResearchDepth;
  timeWindowMonths?: number;
  geographicFocus?: string;
  priorityAreas?: PriorityArea[];
}

export interface GeneratedQuery {
  query: string;
  focusArea: FocusAreaKey;
  focusAreaId: string;
}

const OBJECTIVE_QUERY_EXTRAS: Record<ResearchObjective, string[]> = {
  vendor_assessment: [
    "vendor reliability financial stability assessment",
    "vendor security compliance SOC2 ISO certification",
    "vendor customer references enterprise clients",
    "vendor business continuity disaster recovery",
  ],
  ma_research: [
    "acquisition target due diligence red flags",
    "M&A valuation comparable transactions",
    "target company synergies integration risks",
    "change of control material contracts",
  ],
  competitive_intelligence: [
    "competitive advantage market differentiation",
    "competitor product comparison features pricing",
    "market share win rate competitive landscape",
    "competitor strategy roadmap announcements",
  ],
  market_intelligence: [
    "industry trends market size growth forecast",
    "TAM SAM market opportunity analysis",
    "industry regulation policy impact",
    "emerging competitors market entrants",
  ],
  risk_assessment: [
    "enterprise risk material weaknesses",
    "operational risk regulatory exposure",
    "counterparty credit risk assessment",
    "third party risk vendor dependency",
  ],
};

const PRIORITY_TOPIC_BOOST: Record<PriorityArea, string[]> = {
  financial: [
    "revenue growth profitability financial performance",
    "balance sheet debt covenant liquidity",
    "auditor opinion going concern",
  ],
  reputational: [
    "brand reputation media sentiment controversy",
    "customer satisfaction NPS reviews complaints",
    "employer brand Glassdoor culture ratings",
  ],
  legal: [
    "active litigation regulatory investigation",
    "compliance violations enforcement actions",
    "intellectual property disputes patents",
  ],
  market_position: [
    "market leader share ranking industry position",
    "analyst rating Magic Quadrant Forrester Wave",
    "competitive win loss market momentum",
  ],
  supply_chain: [
    "supply chain disruption dependency risk",
    "key supplier vendor concentration",
    "partnership ecosystem strategic alliances",
  ],
  risk_indicators: [
    "credit downgrade financial distress signals",
    "leadership instability executive turnover",
    "cybersecurity breach incident history",
  ],
};

function getYearRange(months: number): string {
  const now = new Date();
  const startYear = new Date(now);
  startYear.setMonth(startYear.getMonth() - months);
  return `${startYear.getFullYear()} ${now.getFullYear()}`;
}

function buildFocusAreaQueries(
  entityName: string,
  focusAreaKey: FocusAreaKey,
  timeRange: string,
  geo?: string,
): GeneratedQuery[] {
  const area = FOCUS_AREAS[focusAreaKey];
  const geoSuffix = geo ? ` ${geo}` : "";

  return area.topics.map((topic) => ({
    query: `"${entityName}" ${topic} ${timeRange}${geoSuffix}`.trim(),
    focusArea: focusAreaKey,
    focusAreaId: area.id,
  }));
}

export function buildQueries(input: QueryBuilderInput): GeneratedQuery[] {
  const {
    entityName,
    domain,
    objective,
    depth,
    timeWindowMonths = 12,
    geographicFocus,
    priorityAreas = [],
  } = input;

  const timeRange = getYearRange(timeWindowMonths);
  const queries: GeneratedQuery[] = [];

  const focusKeys = Object.keys(FOCUS_AREAS) as FocusAreaKey[];
  for (const key of focusKeys) {
    queries.push(
      ...buildFocusAreaQueries(entityName, key, timeRange, geographicFocus),
    );
  }

  for (const extra of OBJECTIVE_QUERY_EXTRAS[objective]) {
    queries.push({
      query: `"${entityName}" ${extra} ${timeRange}`.trim(),
      focusArea: "risk",
      focusAreaId: "OBJ",
    });
  }

  if (domain) {
    queries.push(
      {
        query: `site:${domain} about company leadership products`,
        focusArea: "companyProfile",
        focusAreaId: "A",
      },
      {
        query: `site:${domain} press release news announcement`,
        focusArea: "companyProfile",
        focusAreaId: "A",
      },
      {
        query: `"${entityName}" site:${domain} investor relations financial`,
        focusArea: "financial",
        focusAreaId: "B",
      },
    );
  }

  queries.push(
    {
      query: `"${entityName}" company official name legal entity DBA`,
      focusArea: "companyProfile",
      focusAreaId: "A",
    },
    {
      query: `"${entityName}" subsidiary parent company ownership`,
      focusArea: "companyProfile",
      focusAreaId: "A",
    },
  );

  for (const priority of priorityAreas) {
    for (const topic of PRIORITY_TOPIC_BOOST[priority]) {
      queries.push({
        query: `"${entityName}" ${topic} ${timeRange}`.trim(),
        focusArea: "risk",
        focusAreaId: "PRI",
      });
    }
  }

  if (depth === "comprehensive") {
    queries.push(
      {
        query: `"${entityName}" SEC Form 8-K material event filing`,
        focusArea: "financial",
        focusAreaId: "B",
      },
      {
        query: `"${entityName}" WARN notice layoff filing state`,
        focusArea: "risk",
        focusAreaId: "F",
      },
      {
        query: `"${entityName}" PACER federal court case docket`,
        focusArea: "legal",
        focusAreaId: "D",
      },
    );
  }

  return dedupeQueries(queries);
}

function dedupeQueries(queries: GeneratedQuery[]): GeneratedQuery[] {
  const seen = new Set<string>();
  return queries.filter((item) => {
    const key = item.query.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getQueryStrings(input: QueryBuilderInput): string[] {
  return buildQueries(input).map((item) => item.query);
}

export function getQueryCount(input: QueryBuilderInput): number {
  return buildQueries(input).length;
}

import { FOCUS_AREAS, type FocusAreaKey } from "@/lib/prompts/focus-areas";
import { getResearchDepthConfig } from "@/lib/research/depth-config";
import type {
  PriorityArea,
  ResearchDepth,
  ResearchObjective,
} from "@/lib/research/types";

export interface QueryBuilderInput {
  entityName: string;
  domain?: string;
  objective: ResearchObjective;
  customObjective?: string;
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
  custom: [
    "business overview strategy operations",
    "financial performance key metrics trends",
    "regulatory legal compliance exposure",
    "market position competitive landscape",
  ],
};

const COMPREHENSIVE_DEEP_DIVES: Record<FocusAreaKey, string[]> = {
  companyProfile: [
    "annual report 10-K business segments",
    "executive leadership board directors",
    "subsidiaries acquisitions corporate structure",
  ],
  financial: [
    "quarterly earnings revenue growth",
    "SEC filing 10-Q investor presentation",
    "credit rating debt covenant liquidity",
  ],
  reputation: [
    "analyst report Gartner Forrester rating",
    "customer reviews enterprise case studies",
    "media coverage press sentiment",
  ],
  legal: [
    "litigation settlement court filing",
    "regulatory enforcement SEC FTC action",
    "patent trademark intellectual property",
  ],
  supplyChain: [
    "strategic partnership key customers",
    "supply chain vendor dependency risk",
    "technology integration ecosystem partners",
  ],
  risk: [
    "cybersecurity breach data incident",
    "layoffs restructuring WARN filing",
    "leadership departure governance changes",
  ],
};

const COMPREHENSIVE_DOMAIN_QUERIES = (
  entityName: string,
  domain: string,
): GeneratedQuery[] => [
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
  {
    query: `site:${domain} careers jobs hiring layoffs`,
    focusArea: "risk",
    focusAreaId: "F",
  },
  {
    query: `site:${domain} security trust compliance certification`,
    focusArea: "legal",
    focusAreaId: "D",
  },
];

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
  topicLimit: number | "all" = "all",
): GeneratedQuery[] {
  const area = FOCUS_AREAS[focusAreaKey];
  const geoSuffix = geo ? ` ${geo}` : "";
  const topics =
    topicLimit === "all" ? area.topics : area.topics.slice(0, topicLimit);

  return topics.map((topic) => ({
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
    customObjective,
    depth,
    timeWindowMonths = getResearchDepthConfig(depth).timeWindowMonths,
    geographicFocus,
    priorityAreas = [],
  } = input;

  const depthConfig = getResearchDepthConfig(depth);
  const timeRange = getYearRange(timeWindowMonths);
  const queries: GeneratedQuery[] = [];

  const focusKeys =
    depthConfig.focusAreaKeys === "all"
      ? (Object.keys(FOCUS_AREAS) as FocusAreaKey[])
      : depthConfig.focusAreaKeys;

  for (const key of focusKeys) {
    queries.push(
      ...buildFocusAreaQueries(
        entityName,
        key,
        timeRange,
        geographicFocus,
        depthConfig.topicsPerFocusArea,
      ),
    );
  }

  const objectiveExtras = OBJECTIVE_QUERY_EXTRAS[objective];
  const extrasToUse =
    depthConfig.objectiveExtraCount === "all"
      ? objectiveExtras
      : objectiveExtras.slice(0, depthConfig.objectiveExtraCount);

  for (const extra of extrasToUse) {
    queries.push({
      query: `"${entityName}" ${extra} ${timeRange}`.trim(),
      focusArea: "risk",
      focusAreaId: "OBJ",
    });
  }

  if (objective === "custom" && customObjective?.trim()) {
    const customTopic = customObjective.trim();
    queries.push(
      {
        query: `"${entityName}" ${customTopic} ${timeRange}`.trim(),
        focusArea: "companyProfile",
        focusAreaId: "CUS",
      },
      {
        query: `"${entityName}" ${customTopic} analysis report`.trim(),
        focusArea: "financial",
        focusAreaId: "CUS",
      },
    );

    if (depth !== "quick") {
      queries.push({
        query: `"${entityName}" ${customTopic} news recent developments`.trim(),
        focusArea: "companyProfile",
        focusAreaId: "CUS",
      });
    }
  }

  if (domain && depthConfig.includeDomainQueries) {
    const domainQueries =
      depthConfig.domainQueryCount >= 5
        ? COMPREHENSIVE_DOMAIN_QUERIES(entityName, domain)
        : [
            {
              query: `site:${domain} about company leadership products`,
              focusArea: "companyProfile" as FocusAreaKey,
              focusAreaId: "A",
            },
            {
              query: `site:${domain} press release news announcement`,
              focusArea: "companyProfile" as FocusAreaKey,
              focusAreaId: "A",
            },
            {
              query: `"${entityName}" site:${domain} investor relations financial`,
              focusArea: "financial" as FocusAreaKey,
              focusAreaId: "B",
            },
          ];
    queries.push(...domainQueries.slice(0, depthConfig.domainQueryCount));
  }

  if (depthConfig.includeEntityMetaQueries) {
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
  }

  if (depthConfig.includePriorityBoosts) {
    for (const priority of priorityAreas) {
      for (const topic of PRIORITY_TOPIC_BOOST[priority]) {
        queries.push({
          query: `"${entityName}" ${topic} ${timeRange}`.trim(),
          focusArea: "risk",
          focusAreaId: "PRI",
        });
      }
    }
  }

  if (depthConfig.includeDeepDiveQueries) {
    for (const key of focusKeys) {
      for (const topic of COMPREHENSIVE_DEEP_DIVES[key]) {
        queries.push({
          query: `"${entityName}" ${topic} ${timeRange}`.trim(),
          focusArea: key,
          focusAreaId: FOCUS_AREAS[key].id,
        });
      }
    }
  }

  if (depthConfig.includeComprehensiveExtras) {
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

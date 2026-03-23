import Anthropic from 'npm:@anthropic-ai/sdk@0.36.3';
import { createClient } from 'npm:@supabase/supabase-js@2';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ── Data fetcher helpers ────────────────────────────────────────────────────

async function fetchReadinessHistory(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('readiness_results')
    .select('date, score, drivers')
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false });
  return data ?? [];
}

async function fetchMetricDetail(userId: string, category: string, metricName: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const query = supabase
    .from('normalized_metrics')
    .select('date, metric_name, value, unit')
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false });
  if (category) query.eq('category', category);
  if (metricName) query.eq('metric_name', metricName);
  const { data } = await query;
  return data ?? [];
}

async function fetchFeedbackHistory(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('user_feedback')
    .select('date, feeling_score, notes')
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false });
  return data ?? [];
}

async function fetchGoals(userId: string) {
  const { data } = await supabase
    .from('goals')
    .select('title, category, target_value, current_value, unit, status, deadline')
    .eq('user_id', userId)
    .eq('status', 'active');
  return data ?? [];
}

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'query_readiness_history',
    description: 'Fetch the user\'s readiness scores and top drivers for the last N days.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to look back (1-30).' },
      },
      required: ['days'],
    },
  },
  {
    name: 'query_metric_detail',
    description: 'Fetch a specific health metric trend for the last N days. Use category (sleep, recovery, activity, cardio, body, hydration, nutrition) and optionally a metric_name.',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Metric category: sleep, recovery, activity, cardio, body, hydration, or nutrition.' },
        metric_name: { type: 'string', description: 'Specific metric name to filter by (e.g. hrv_ms, resting_hr, sleep_quality_score). Leave empty to get all metrics in the category.' },
        days: { type: 'number', description: 'Number of days to look back (1-30).' },
      },
      required: ['category', 'days'],
    },
  },
  {
    name: 'query_feedback_history',
    description: 'Fetch the user\'s daily 1-10 feeling scores for the last N days.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to look back (1-30).' },
      },
      required: ['days'],
    },
  },
  {
    name: 'query_goals',
    description: 'Fetch the user\'s active goals with current progress.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// ── Tool execution ──────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>, userId: string): Promise<string> {
  switch (name) {
    case 'query_readiness_history': {
      const data = await fetchReadinessHistory(userId, (input.days as number) ?? 7);
      return JSON.stringify(data);
    }
    case 'query_metric_detail': {
      const data = await fetchMetricDetail(
        userId,
        (input.category as string) ?? '',
        (input.metric_name as string) ?? '',
        (input.days as number) ?? 7,
      );
      return JSON.stringify(data);
    }
    case 'query_feedback_history': {
      const data = await fetchFeedbackHistory(userId, (input.days as number) ?? 7);
      return JSON.stringify(data);
    }
    case 'query_goals': {
      const data = await fetchGoals(userId);
      return JSON.stringify(data);
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ── Build system prompt with 14-day health snapshot ─────────────────────────

async function buildSystemPrompt(userId: string): Promise<string> {
  const [profile, readiness, feedback, goals] = await Promise.all([
    supabase.from('profiles').select('display_name, hydration_bottle_oz').eq('id', userId).single(),
    fetchReadinessHistory(userId, 14),
    fetchFeedbackHistory(userId, 14),
    fetchGoals(userId),
  ]);

  const name = profile.data?.display_name ?? 'the user';
  const latestReadiness = readiness[0];
  const avgReadiness = readiness.length
    ? Math.round(readiness.reduce((s, r) => s + Number(r.score), 0) / readiness.length)
    : null;
  const avgFeeling = feedback.length
    ? (feedback.reduce((s, f) => s + f.feeling_score, 0) / feedback.length).toFixed(1)
    : null;

  return `You are HealthHub AI, a personal health assistant for ${name}.

Today's readiness score: ${latestReadiness ? `${Math.round(latestReadiness.score)}/100` : 'not yet computed'}
14-day average readiness: ${avgReadiness ?? 'insufficient data'}
14-day average feeling score: ${avgFeeling ?? 'insufficient data'}/10
Active goals: ${goals.length ? goals.map(g => `${g.title} (${g.current_value}/${g.target_value} ${g.unit})`).join(', ') : 'none set'}

You have access to tools to fetch detailed health data when needed. Use them to give accurate, data-backed answers.

Guidelines:
- Be concise and direct — one to three paragraphs max
- Reference specific numbers from the data when possible
- Focus on actionable insights, not generic health advice
- If data is missing or sparse, say so honestly
- Today's date: ${new Date().toISOString().split('T')[0]}`;
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { messages, userId } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      userId: string;
    };

    if (!userId || !messages?.length) {
      return new Response(JSON.stringify({ error: 'userId and messages are required' }), { status: 400 });
    }

    const systemPrompt = await buildSystemPrompt(userId);

    // Agentic tool-use loop
    const apiMessages: Anthropic.MessageParam[] = messages.map(m => ({ role: m.role, content: m.content }));

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: apiMessages,
    });

    // Handle tool calls until Claude produces a final text response
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: await executeTool(block.name, block.input as Record<string, unknown>, userId),
        })),
      );

      apiMessages.push({ role: 'assistant', content: response.content });
      apiMessages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages: apiMessages,
      });
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    const reply = textBlock?.text ?? 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('health-chat error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

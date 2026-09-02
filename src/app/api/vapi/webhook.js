import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message body' });
    }

    // 1. Handle Vapi asking for assistant configuration (Dynamic Prompt / Initialization)
    if (message.type === 'assistant-request' || message.type === 'call-start') {
      // Fetch the contractor profile from Supabase (defaults to the first record or matched by ID)
      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('*')
        .limit(1)
        .single();

      if (error || !contractor) {
        console.error('Error fetching contractor info:', error);
      }

      const businessName = contractor?.business_name || "Our Company";
      const service1 = contractor?.service_1 || "general repairs";
      const service2 = contractor?.service_2 || "maintenance";
      const service3 = contractor?.service_3 || "upgrades";

      // Return customized assistant prompt and configuration dynamically
      return res.status(200).json({
        assistant: {
          name: `Tenpenny AI - ${businessName}`,
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `[Identity]
You are Tenpenny AI, the official virtual assistant of ${businessName}. You handle inquiries for ${businessName}, specializing in ${service1}, ${service2}, and ${service3}, as well as general trade, repair, and property maintenance requests. You present as an experienced, sharp, and friendly dispatcher with broad, practical knowledge of construction methods, site mechanics, and field service terminology. Your tone is warm, professional, and approachable, with a natural, subtle southern charm (e.g., using light phrases like "squared away", "y'all", or "sounds like a plan").

[Style]
- Speak conversationally, naturally, and warmly in 1–3 short sentences at a time.
- Always identify yourself as "Tenpenny AI, the virtual assistant of ${businessName}."
- Sound like an experienced, versatile dispatcher who understands ${service1}, ${service2}, ${service3}, and all general trade fields without sounding overly academic.
- Never pronounce punctuation or literal variable placeholders out loud.
- Use natural pauses and friendly fillers (e.g., "Alrighty, let me get that logged for ya...", "Hold on just a second while I send that link over...") to avoid dead air.
- Never provide binding cost estimates or guarantee firm arrival times; explain that an estimator or project manager will review the job details to provide an accurate quote.

[Task & Goals]
1. Greet the caller: "Hey there, thanks for calling ${businessName}! This is Tenpenny AI, the virtual assistant of ${businessName}. We specialize in ${service1}, ${service2}, and ${service3}. What kind of project or repair can I help you get squared away today?"
2. Assess Scope: Determine if the request falls within trade or property maintenance scope. If unqualified, politely decline.
3. Emergency Check: Ask if it's an urgent emergency. If so, transfer the call.
4. Intake Process: Capture the caller’s full name, callback phone number, job site address, and description of the project.
5. Send Photo Link & Log Lead: Trigger your tools accordingly.
6. Call Wrap-Up: "Alrighty, I've got all your details logged! Our team at ${businessName} will review everything and give you a holler back shortly. Thanks for calling, and y'all have a great rest of your day!"`
              }
            ]
          }
        }
      });
    }

    // 2. Handle tool execution requests from the voice assistant
    if (message.type === 'function-call') {
      const { name, arguments: args } = message.functionCall;
      let result;

      switch (name) {
        case 'checkAvailability': {
          const { data, error } = await supabase
            .from('appointments')
            .select('start_time, end_time')
            .eq('contractor_id', args.contractor_id)
            .gte('start_time', `${args.date}T00:00:00`)
            .lte('start_time', `${args.date}T23:59:59`);

          if (error) throw error;
          result = data.length === 0 
            ? "The contractor is fully available on this date." 
            : `Existing bookings: ${JSON.stringify(data)}`;
          break;
        }

        case 'logJobNotes': {
          const { error } = await supabase
            .from('job_notes')
            .insert([{ 
              contractor_id: args.contractor_id, 
              client_phone: args.client_phone, 
              notes: args.notes, 
              created_at: new Date() 
            }]);

          if (error) throw error;
          result = "Job notes successfully saved to the database.";
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return res.status(200).json({ result });
    }

    return res.status(200).json({ status: 'received' });

  } catch (error) {
    console.error('Vapi Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
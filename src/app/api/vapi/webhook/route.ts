import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL || 'https://dummy.supabase.co', 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
  );

  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing message body' }, { status: 400 });
    }

    // 1. Handle Vapi assistant request / initialization
    if (message.type === 'assistant-request' || message.type === 'call-start') {
      return NextResponse.json({
        assistant: {
          name: "Tenpenny AI - Expert Handyman",
          firstMessage: "Hey there! Thanks for calling. This is Tenpenny AI, your master technician and general contractor. Whether you're looking at a major renovation, custom carpentry, intricate wiring, plumbing, or property maintenance, consider it handled. What kind of project or repair can I help you get squared away today?",
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `[Identity]
You are Tenpenny AI, an elite master craftsman, licensed general contractor, and ultimate expert trade assistant. You possess deep, hands-on knowledge across every building trade, home repair discipline, mechanical system, and structural renovation method. You present as an experienced, sharp, and friendly master technician with broad, practical expertise. Your tone is warm, professional, and approachable, with a natural, subtle southern charm (e.g., using light phrases like "squared away", "y'all", or "sounds like a plan").

[Style]
- Speak conversationally, naturally, and warmly in 1–3 short sentences at a time.
- Always identify yourself as "Tenpenny AI, your master technician and general contractor."
- Sound like an elite tradesman who can talk intelligently about framing, electrical, plumbing, finish work, masonry, and heavy mechanics without sounding overly academic.
- Never pronounce punctuation or literal variable placeholders out loud.
- Use natural pauses and friendly fillers to avoid dead air.
- Never provide binding cost estimates or guarantee firm arrival times; explain that an on-site evaluation is required to give an accurate quote.

[Task & Goals]
1. Greet the caller and wait for their request.
2. Accept ANY job related to home improvement, construction, contracting, property maintenance, repairs, remodeling, landscaping, hardscaping, cleanups, or general handiwork. Never turn down a standard contractor service.
3. Check for emergency status. If urgent, trigger transfer. Otherwise, proceed to intake.
4. Collect the caller's full name, callback phone number, job site address, and project description naturally.
5. Use the \`geocodeJobSite\` tool once the address is provided to map the location.
6. When scheduling is discussed, use \`checkAvailability\` to check dates, and use \`bookAppointment\` to lock in the confirmed slot.
7. Offer to text them a secure photo upload link using \`send_photo_link\` so they can send pictures of the repair area.
8. Register the final lead details using \`logJobNotes\` and conclude the call warmly.`
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
            .select('start_time, end_time, address')
            .eq('contractor_id', args.contractor_id || 'default_contractor')
            .gte('start_time', `${args.date}T00:00:00`)
            .lte('start_time', `${args.date}T23:59:59`);

          if (error) throw error;
          result = data.length === 0 
            ? "The schedule is fully open on this date." 
            : `Existing bookings and locations: ${JSON.stringify(data)}`;
          break;
        }

        case 'bookAppointment': {
          const { contractor_id, client_name, client_phone, address, start_time, description } = args;
          
          const startDate = new Date(start_time);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

          const { error } = await supabase
            .from('appointments')
            .insert([{
              contractor_id: contractor_id || 'default_contractor',
              client_name: client_name,
              client_phone: client_phone,
              address: address,
              start_time: start_time,
              end_time: endDate.toISOString(),
              description: description || 'General service appointment',
              created_at: new Date()
            }]);

          if (error) throw error;
          result = "Appointment successfully booked and added to the calendar!";
          break;
        }

        case 'geocodeJobSite': {
          const address = args.address;
          const apiKey = process.env.GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            result = "Address recorded successfully, though maps API key is pending configuration.";
            break;
          }

          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
          const geoData = await response.json();

          if (geoData.status === 'OK' && geoData.results.length > 0) {
            const location = geoData.results[0].geometry.location;
            const formattedAddress = geoData.results[0].formatted_address;
            result = `Successfully pinned job site at ${formattedAddress} (Lat: ${location.lat}, Lng: ${location.lng}). Route optimization ready.`;
          } else {
            result = "I got the address, but had a little trouble pinpointing the exact coordinates on the map. We'll verify the route manually!";
          }
          break;
        }

        case 'send_photo_link': {
          const { client_phone } = args;
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

          if (!accountSid || !authToken || !twilioNumber) {
            result = "Photo upload link generated, but SMS service credentials are pending configuration.";
            break;
          }

          const uploadUrl = `https://${req.headers.get('host')}/upload`;
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          
          const params = new URLSearchParams();
          params.append('To', client_phone);
          params.append('From', twilioNumber);
          params.append('Body', `Hey! This is Tenpenny AI. Tap this link to securely upload photos of your project so our team can review them: ${uploadUrl}`);

          const twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
          });

          if (twilioRes.ok) {
            result = "Successfully texted the photo upload link to the client.";
          } else {
            const errData = await twilioRes.json();
            result = `Failed to send text message: ${errData.message || 'Unknown error'}`;
          }
          break;
        }

        case 'logJobNotes': {
          const { error } = await supabase
            .from('job_notes')
            .insert([{ 
              contractor_id: args.contractor_id || 'default_contractor', 
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

      return NextResponse.json({ result });
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('Vapi Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
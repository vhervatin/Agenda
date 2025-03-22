
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ddsdidxdwdbqdoyczhyq.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the webhook payload
    const payload = await req.json();
    const eventType = payload.evento;
    console.log(`Processing webhook for event: ${eventType}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);

    // Get webhook URL
    const { data: webhookConfigs, error: webhookError } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (webhookError || !webhookConfigs.length) {
      console.error('No active webhook configurations found', webhookError);
      return new Response(
        JSON.stringify({ success: false, error: 'No active webhook configurations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const webhookUrl = webhookConfigs[0].url;
    const webhookId = webhookConfigs[0].id;
    
    // Send the webhook
    let success = false;
    let attempts = 0;
    let statusCode = 0;
    let responseText = '';

    // Try up to 3 times
    while (!success && attempts < 3) {
      attempts++;
      
      try {
        console.log(`Attempt ${attempts}: Sending webhook to ${webhookUrl}`);
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        statusCode = response.status;
        responseText = await response.text();
        success = response.ok;
        
        console.log(`Webhook response (${statusCode}): ${responseText}`);
        
        if (success) break;
        
        // Wait before retrying (exponential backoff)
        if (attempts < 3) {
          const waitTime = Math.pow(2, attempts) * 1000;
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (err) {
        console.error(`Webhook delivery error on attempt ${attempts}:`, err);
      }
    }

    // Update the webhook log
    const status = success ? 'delivered' : 'failed';
    const { error: logError } = await supabase
      .from('webhook_logs')
      .update({
        status,
        attempts,
        updated_at: new Date().toISOString(),
      })
      .eq('webhook_id', webhookId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(1);

    if (logError) {
      console.error('Error updating webhook log:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success, 
        attempts, 
        statusCode,
        response: responseText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

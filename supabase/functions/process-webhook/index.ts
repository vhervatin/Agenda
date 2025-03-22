
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.9.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get payload from request
    const payload = await req.json();
    
    // Get webhook URL from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: webhookConfig, error: configError } = await supabase
      .from('webhook_configurations')
      .select('id, url')
      .eq('is_active', true)
      .single();
    
    if (configError || !webhookConfig) {
      console.error('Error getting webhook URL:', configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active webhook configuration found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }
    
    // Attempt to send the webhook
    let success = false;
    let attempts = 0;
    let maxAttempts = 3;
    let lastError = null;
    
    // Create a log entry
    const { data: logEntry, error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        webhook_id: webhookConfig.id,
        event_type: payload.evento || 'unknown',
        payload: payload,
        status: 'pending',
        attempts: 0
      })
      .select()
      .single();
    
    if (logError) {
      console.error('Error creating webhook log entry:', logError);
    }
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
      try {
        const response = await fetch(webhookConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          success = true;
          
          // Update the log entry
          if (logEntry) {
            await supabase
              .from('webhook_logs')
              .update({
                status: 'success',
                attempts: attempts
              })
              .eq('id', logEntry.id);
          }
          
          break;
        } else {
          lastError = `HTTP error: ${response.status} ${response.statusText}`;
          
          // Wait before retrying (exponential backoff)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      } catch (error) {
        lastError = error.message;
        
        // Wait before retrying (exponential backoff)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
        }
      }
    }
    
    // Update the log entry if failed
    if (!success && logEntry) {
      await supabase
        .from('webhook_logs')
        .update({
          status: 'failed',
          attempts: attempts
        })
        .eq('id', logEntry.id);
    }
    
    return new Response(
      JSON.stringify({ 
        success, 
        attempts,
        error: lastError 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500 
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};

Deno.serve(handler);

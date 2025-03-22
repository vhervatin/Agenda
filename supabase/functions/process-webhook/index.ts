
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface WebhookPayload {
  evento: string;
  id_agendamento: string;
  [key: string]: any;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        status: 204,
      });
    }

    // Only handle POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the request body
    const payload: WebhookPayload = await req.json();
    console.log('Received webhook payload:', payload);

    // Get webhook configurations
    const { data: webhookConfigs, error: configError } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      console.error('Error fetching webhook configurations:', configError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!webhookConfigs || webhookConfigs.length === 0) {
      console.log('No active webhook configurations found');
      return new Response(JSON.stringify({ message: 'No webhooks to process' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process each webhook
    const results = await Promise.allSettled(
      webhookConfigs.map(async (config) => {
        let attempts = 1;
        let success = false;
        let lastError = null;
        
        // Try up to 3 times
        while (attempts <= 3 && !success) {
          try {
            const response = await fetch(config.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              success = true;
              console.log(`Webhook sent successfully to ${config.url} on attempt ${attempts}`);
            } else {
              lastError = `HTTP error: ${response.status} ${response.statusText}`;
              console.error(`Failed to send webhook on attempt ${attempts}: ${lastError}`);
              attempts++;
              // Wait a bit before retrying (exponential backoff)
              if (attempts <= 3) {
                await new Promise(resolve => setTimeout(resolve, attempts * 1000));
              }
            }
          } catch (error) {
            lastError = error.message || 'Unknown error';
            console.error(`Error sending webhook on attempt ${attempts}:`, error);
            attempts++;
            // Wait a bit before retrying
            if (attempts <= 3) {
              await new Promise(resolve => setTimeout(resolve, attempts * 1000));
            }
          }
        }

        // Update the log
        const { error: logError } = await supabase
          .from('webhook_logs')
          .update({
            status: success ? 'success' : 'failed',
            attempts,
            updated_at: new Date().toISOString(),
          })
          .eq('webhook_id', config.id)
          .eq('event_type', payload.evento)
          .eq('payload', payload);

        if (logError) {
          console.error('Error updating webhook log:', logError);
        }

        return {
          webhookId: config.id,
          success,
          attempts,
          error: lastError,
        };
      })
    );

    return new Response(JSON.stringify({ 
      message: 'Webhook processing completed',
      results 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error in webhook processor:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

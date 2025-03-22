
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Configure Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Serve HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { url, event_type, payload } = requestData;

    // Validate required fields
    if (!url || !event_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get or create webhook configuration
    let webhookConfig;
    
    const { data: existingWebhooks, error: fetchError } = await supabase
      .from("webhook_configurations")
      .select("*")
      .eq("url", url)
      .limit(1);
      
    if (fetchError) {
      console.error("Error fetching webhooks:", fetchError);
    }
    
    if (existingWebhooks && existingWebhooks.length > 0) {
      webhookConfig = existingWebhooks[0];
    } else {
      // Create a new webhook configuration
      const { data: newWebhook, error: createError } = await supabase
        .from("webhook_configurations")
        .insert([
          {
            url,
            is_active: true,
            event_type,
          },
        ])
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating webhook:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create webhook configuration" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      webhookConfig = newWebhook;
    }

    // Create a test payload if not provided
    const testPayload = payload || {
      test: true,
      timestamp: new Date().toISOString(),
      message: "This is a test webhook event",
    };

    // Create a log entry for this webhook test
    const { data: logEntry, error: logError } = await supabase
      .from("webhook_logs")
      .insert([
        {
          webhook_id: webhookConfig.id,
          event_type,
          payload: testPayload,
          status: "pending",
          attempts: 0,
        },
      ])
      .select()
      .single();

    if (logError) {
      console.error("Failed to create webhook log:", logError);
    }

    // Send the test webhook
    let success = false;
    let errorMessage = "";
    
    try {
      const webhookResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: event_type,
          data: testPayload,
          timestamp: new Date().toISOString(),
          test: true,
        }),
      });

      success = webhookResponse.ok;
      
      // Update the log with the result
      if (logEntry?.id) {
        await supabase
          .from("webhook_logs")
          .update({
            status: success ? "success" : "failed",
            attempts: 1,
          })
          .eq("id", logEntry.id);
      }
    } catch (error: any) {
      console.error("Error sending test webhook:", error);
      errorMessage = error.message || "Unknown error";
      
      // Update the log with the error
      if (logEntry?.id) {
        await supabase
          .from("webhook_logs")
          .update({
            status: "failed",
            attempts: 1,
          })
          .eq("id", logEntry.id);
      }
    }

    return new Response(
      JSON.stringify({
        success,
        message: success ? "Test webhook delivered successfully" : `Test webhook delivery failed: ${errorMessage}`,
        logId: logEntry?.id,
        webhookId: webhookConfig.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Test webhook error:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
